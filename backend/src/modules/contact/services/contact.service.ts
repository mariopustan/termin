import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from '../dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Normalize a phone number to E.164 format (+491701234567).
   * Strips spaces, dashes, parentheses and converts leading 0 to +49.
   */
  normalizePhone(phone: string): string {
    let normalized = phone.replace(/[\s\-()]/g, '');

    // Convert German national format to international
    if (normalized.startsWith('0') && !normalized.startsWith('00')) {
      normalized = '+49' + normalized.substring(1);
    }
    if (normalized.startsWith('00')) {
      normalized = '+' + normalized.substring(2);
    }
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }

    return normalized;
  }

  /**
   * Look up a contact by phone number.
   */
  async findByPhone(phone: string): Promise<Contact | null> {
    const normalized = this.normalizePhone(phone);
    return this.contactRepository.findOne({ where: { phone: normalized } });
  }

  /**
   * Track an incoming call: increment callCount and update lastCallAt.
   * Returns the contact if found, null otherwise.
   */
  async trackCall(phone: string): Promise<Contact | null> {
    const normalized = this.normalizePhone(phone);
    const contact = await this.contactRepository.findOne({
      where: { phone: normalized },
    });

    if (!contact) {
      return null;
    }

    contact.callCount += 1;
    contact.lastCallAt = new Date();
    await this.contactRepository.save(contact);

    this.logger.log(
      `Tracked call from known contact: ${contact.firstName} ${contact.lastName} (${normalized}), call #${contact.callCount}`,
    );

    return contact;
  }

  /**
   * Create or update a contact from booking data.
   * Called after a successful booking to persist caller info.
   */
  async createOrUpdateFromBooking(
    phone: string,
    firstName: string,
    lastName: string,
    companyName: string,
    email: string,
  ): Promise<Contact> {
    const normalized = this.normalizePhone(phone);
    let contact = await this.contactRepository.findOne({
      where: { phone: normalized },
    });

    if (contact) {
      contact.firstName = firstName;
      contact.lastName = lastName;
      contact.companyName = companyName;
      contact.email = email;
      await this.contactRepository.save(contact);
      this.logger.log(`Updated contact: ${firstName} ${lastName} (${normalized})`);
    } else {
      contact = this.contactRepository.create({
        phone: normalized,
        firstName,
        lastName,
        companyName,
        email,
        callCount: 0,
      });
      await this.contactRepository.save(contact);
      this.logger.log(`Created new contact: ${firstName} ${lastName} (${normalized})`);
    }

    return contact;
  }

  /**
   * Paginated list of contacts with optional search.
   */
  async findAll(
    search?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.contactRepository.createQueryBuilder('c');

    if (search) {
      const term = `%${search}%`;
      queryBuilder.where(
        'c.first_name ILIKE :term OR c.last_name ILIKE :term OR c.company_name ILIKE :term OR c.email ILIKE :term OR c.phone ILIKE :term',
        { term },
      );
    }

    queryBuilder
      .orderBy('c.updated_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find a single contact by ID.
   */
  async findById(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException('Kontakt nicht gefunden.');
    }
    return contact;
  }

  /**
   * Create a new contact (admin).
   */
  async create(dto: CreateContactDto): Promise<Contact> {
    const normalized = this.normalizePhone(dto.phone);

    const existing = await this.contactRepository.findOne({
      where: { phone: normalized },
    });
    if (existing) {
      throw new ConflictException(
        `Ein Kontakt mit der Nummer ${normalized} existiert bereits.`,
      );
    }

    const contact = this.contactRepository.create({
      phone: normalized,
      firstName: dto.firstName || null,
      lastName: dto.lastName || null,
      companyName: dto.companyName || null,
      email: dto.email || null,
      callCount: 0,
    });

    await this.contactRepository.save(contact);
    this.logger.log(`Admin created contact: ${dto.firstName} ${dto.lastName} (${normalized})`);
    return contact;
  }

  /**
   * Update an existing contact (admin).
   */
  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findById(id);

    if (dto.phone) {
      const normalized = this.normalizePhone(dto.phone);
      if (normalized !== contact.phone) {
        const existing = await this.contactRepository.findOne({
          where: { phone: normalized },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(
            `Ein Kontakt mit der Nummer ${normalized} existiert bereits.`,
          );
        }
        contact.phone = normalized;
      }
    }

    if (dto.firstName !== undefined) contact.firstName = dto.firstName || null;
    if (dto.lastName !== undefined) contact.lastName = dto.lastName || null;
    if (dto.companyName !== undefined) contact.companyName = dto.companyName || null;
    if (dto.email !== undefined) contact.email = dto.email || null;

    await this.contactRepository.save(contact);
    this.logger.log(`Admin updated contact: ${contact.firstName} ${contact.lastName} (${contact.phone})`);
    return contact;
  }

  /**
   * Delete a contact (admin).
   */
  async remove(id: string): Promise<void> {
    const contact = await this.findById(id);
    await this.contactRepository.remove(contact);
    this.logger.log(`Admin deleted contact: ${contact.firstName} ${contact.lastName} (${contact.phone})`);
  }
}
