import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';

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
}
