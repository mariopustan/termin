import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  BadRequestException,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateContactDto, UpdateContactDto } from '../dto/create-contact.dto';

interface WebhookBody {
  fromNumber?: string;
  toNumber?: string;
}

interface SaveContactBody {
  phone?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  // Fonio values array format
  values?: string[];
}

@Controller('contacts')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  /**
   * Fonio Inbound Webhook — called on every incoming call.
   * Receives the caller's phone number and returns contact data if known.
   */
  @Public()
  @Post('webhook')
  async handleInboundWebhook(@Body() body: WebhookBody) {
    const { fromNumber } = body;

    if (!fromNumber) {
      this.logger.warn('Webhook called without fromNumber');
      return { isKnownCaller: false };
    }

    const contact = await this.contactService.trackCall(fromNumber);

    if (!contact) {
      this.logger.debug(`Unknown caller: ${fromNumber}`);
      return { isKnownCaller: false };
    }

    return {
      isKnownCaller: true,
      firstName: contact.firstName,
      lastName: contact.lastName,
      companyName: contact.companyName,
      email: contact.email,
      phone: contact.phone,
      phoneMobile: contact.phoneMobile,
      callCount: contact.callCount,
    };
  }

  /**
   * Save or update contact data — called by Fonio tool after collecting
   * caller information during any type of call (not just bookings).
   */
  @Post('save')
  async saveContact(@Body() body: SaveContactBody) {
    // Handle Fonio values array format
    let { phone, firstName, lastName, companyName, email } = body;
    if (body.values && Array.isArray(body.values)) {
      [firstName, lastName, companyName, email, phone] = body.values;
    }

    if (!phone) {
      throw new BadRequestException('Telefonnummer ist erforderlich.');
    }

    const contact = await this.contactService.createOrUpdateFromBooking(
      phone,
      firstName || '',
      lastName || '',
      companyName || '',
      email || '',
    );

    this.logger.log(`Contact saved via tool: ${firstName} ${lastName} (${phone})`);

    return {
      success: true,
      message: `Kontaktdaten von ${firstName} ${lastName} wurden gespeichert.`,
      contactId: contact.id,
    };
  }

  // ─── Admin CRUD Endpoints (JWT-protected) ──────────────────────
  // @Public() bypasses the global ApiKeyGuard; JwtAuthGuard handles auth.

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactService.findAll(
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.findById(id);
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactService.update(id, dto);
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.contactService.remove(id);
    return { message: 'Kontakt wurde gelöscht.' };
  }
}
