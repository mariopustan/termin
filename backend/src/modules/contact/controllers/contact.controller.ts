import { Controller, Post, Body, Logger, BadRequestException } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { Public } from '../../../common/decorators/public.decorator';

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
}
