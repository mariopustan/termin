import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { Public } from '../../../common/decorators/public.decorator';

interface WebhookBody {
  fromNumber?: string;
  toNumber?: string;
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
}
