import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ProductInterest } from '../../booking/interfaces/booking-status.enum';

const PRODUCT_LABELS: Record<ProductInterest, string> = {
  [ProductInterest.ENTERPRISE_API]: 'Enterprise API',
  [ProductInterest.HR_PAYROLL_INTEGRATION]: 'HR & Payroll Integration',
  [ProductInterest.PORTALE]: 'Mitarbeiter- & Arbeitgeberportal',
  [ProductInterest.PAYROLL_SCANNER]: 'Gehaltsabrechnungs-Scanner',
};

export interface BookingConfirmationData {
  to: string;
  firstName: string;
  lastName: string;
  company: string;
  date: Date;
  zoomJoinUrl: string;
  productInterest: ProductInterest;
  cancellationToken: string;
}

export interface InternalNotificationData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  date: Date;
  productInterest: ProductInterest;
  zoomStartUrl: string;
  message?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly fromAddress: string;
  private readonly internalRecipient: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress = this.configService.get<string>(
      'mail.from',
      'noreply@demo-itw.de',
    );
    this.internalRecipient = this.configService.get<string>(
      'mail.internalRecipient',
      '',
    );
    this.baseUrl = this.configService.get<string>(
      'app.corsOrigin',
      'https://termin.demo-itw.de',
    );

    const mailUser = this.configService.get<string>('mail.user', '');
    const mailPass = this.configService.get<string>('mail.password', '');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host', 'localhost'),
      port: this.configService.get<number>('mail.port', 25),
      secure: false,
      ...(mailUser && mailPass ? { auth: { user: mailUser, pass: mailPass } } : {}),
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
    const dateFormatted = format(data.date, "EEEE, dd. MMMM yyyy 'um' HH:mm 'Uhr'", {
      locale: de,
    });
    const productLabel = PRODUCT_LABELS[data.productInterest];
    const cancellationUrl = `${this.baseUrl}/stornierung/${data.cancellationToken}`;

    const icsContent = this.generateICS({
      summary: `IT Warehouse Demo: ${productLabel}`,
      start: data.date,
      durationMinutes: 30,
      description: `Zoom-Meeting: ${data.zoomJoinUrl}`,
      location: data.zoomJoinUrl,
    });

    const html = this.buildConfirmationEmail(
      data.firstName,
      dateFormatted,
      productLabel,
      data.zoomJoinUrl,
      cancellationUrl,
    );

    try {
      await this.transporter.sendMail({
        from: `"IT Warehouse AG" <${this.fromAddress}>`,
        to: data.to,
        subject: `Terminbestaetigung: ${productLabel} Demo am ${format(data.date, 'dd.MM.yyyy')}`,
        html,
        icalEvent: {
          filename: 'termin.ics',
          method: 'REQUEST',
          content: icsContent,
        },
      });

      this.logger.log(`Confirmation email sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to ${data.to}`, error);
      throw error;
    }
  }

  async sendInternalNotification(data: InternalNotificationData): Promise<void> {
    if (!this.internalRecipient) {
      this.logger.warn('No internal recipient configured, skipping notification');
      return;
    }

    const dateFormatted = format(data.date, "dd.MM.yyyy 'um' HH:mm 'Uhr'", {
      locale: de,
    });
    const productLabel = PRODUCT_LABELS[data.productInterest];

    const html = this.buildInternalNotificationEmail(
      data,
      dateFormatted,
      productLabel,
    );

    try {
      await this.transporter.sendMail({
        from: `"SalesFunnel System" <${this.fromAddress}>`,
        to: this.internalRecipient,
        subject: `Neue Demo-Buchung: ${data.company} - ${productLabel}`,
        html,
      });

      this.logger.log('Internal notification email sent');
    } catch (error) {
      this.logger.error('Failed to send internal notification email', error);
    }
  }

  private buildConfirmationEmail(
    firstName: string,
    dateFormatted: string,
    productLabel: string,
    zoomJoinUrl: string,
    cancellationUrl: string,
  ): string {
    return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0f1c;font-family:'Open Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1c;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a2634;border-radius:16px;overflow:hidden;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#e87a1e,#d16a18);padding:30px 40px;text-align:center;">
  <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">IT Warehouse AG</h1>
  <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Terminbestaetigung</p>
</td></tr>

<!-- Content -->
<tr><td style="padding:40px;">
  <p style="color:#ffffff;font-size:16px;line-height:1.6;margin:0 0 20px;">
    Hallo ${firstName},
  </p>
  <p style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;margin:0 0 30px;">
    vielen Dank fuer Ihre Terminbuchung! Wir freuen uns, Ihnen unsere <strong style="color:#e87a1e;">${productLabel}</strong> vorzustellen.
  </p>

  <!-- Appointment Details -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.05);border-radius:12px;border:1px solid rgba(255,255,255,0.1);margin:0 0 30px;">
  <tr><td style="padding:24px;">
    <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Ihr Termin</p>
    <p style="color:#ffffff;font-size:18px;font-weight:600;margin:0 0 4px;">${dateFormatted}</p>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Dauer: 30 Minuten</p>
  </td></tr>
  </table>

  <!-- Zoom Button -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
  <tr><td align="center">
    <a href="${zoomJoinUrl}" style="display:inline-block;background:linear-gradient(135deg,#e87a1e,#d16a18);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
      Zoom-Meeting beitreten
    </a>
  </td></tr>
  <tr><td align="center" style="padding-top:12px;">
    <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">
      Link: <a href="${zoomJoinUrl}" style="color:#8cced9;">${zoomJoinUrl}</a>
    </p>
  </td></tr>
  </table>

  <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0 0 20px;">
    Bitte klicken Sie zum Termin auf den Button oben, um dem Zoom-Meeting beizutreten.
    Eine Kalendereinladung ist dieser E-Mail als .ics-Datei angehaengt.
  </p>

  <!-- Cancellation Link -->
  <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;margin:0;">
    Muessen Sie den Termin absagen? <a href="${cancellationUrl}" style="color:#8cced9;">Termin stornieren</a>
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="background:rgba(0,0,0,0.2);padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);">
  <p style="color:rgba(255,255,255,0.4);font-size:12px;line-height:1.5;margin:0;text-align:center;">
    IT Warehouse AG &middot; Hamburg, Deutschland<br>
    <a href="https://www.it-warehouse.de" style="color:#8cced9;">www.it-warehouse.de</a> &middot;
    <a href="https://www.it-warehouse.de/datenschutz" style="color:#8cced9;">Datenschutz</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
  }

  private buildInternalNotificationEmail(
    data: InternalNotificationData,
    dateFormatted: string,
    productLabel: string,
  ): string {
    return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background-color:#f5f5f5;font-family:'Open Sans',Arial,sans-serif;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:30px;">
<tr><td>
  <h2 style="color:#1a2634;margin:0 0 20px;">Neue Demo-Buchung</h2>

  <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:8px;">
  <tr><td style="color:#666;width:140px;">Produkt:</td><td style="color:#1a2634;font-weight:600;">${productLabel}</td></tr>
  <tr style="background:#f9f9f9;"><td style="color:#666;">Termin:</td><td style="color:#1a2634;">${dateFormatted}</td></tr>
  <tr><td style="color:#666;">Name:</td><td style="color:#1a2634;">${data.firstName} ${data.lastName}</td></tr>
  <tr style="background:#f9f9f9;"><td style="color:#666;">Unternehmen:</td><td style="color:#1a2634;">${data.company}</td></tr>
  <tr><td style="color:#666;">E-Mail:</td><td><a href="mailto:${data.email}" style="color:#e87a1e;">${data.email}</a></td></tr>
  <tr style="background:#f9f9f9;"><td style="color:#666;">Telefon:</td><td style="color:#1a2634;">${data.phone}</td></tr>
  ${data.message ? `<tr><td style="color:#666;">Nachricht:</td><td style="color:#1a2634;">${data.message}</td></tr>` : ''}
  </table>

  <p style="margin:20px 0 0;">
    <a href="${data.zoomStartUrl}" style="display:inline-block;background:#e87a1e;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600;">
      Zoom-Meeting starten
    </a>
  </p>
</td></tr>
</table>
</body>
</html>`;
  }

  private generateICS(params: {
    summary: string;
    start: Date;
    durationMinutes: number;
    description: string;
    location: string;
  }): string {
    const end = new Date(
      params.start.getTime() + params.durationMinutes * 60 * 1000,
    );

    const formatICSDate = (date: Date): string =>
      date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SalesFunnel//Booking//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:salesfunnel-${Date.now()}@demo-itw.de`,
      `DTSTART:${formatICSDate(params.start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${params.summary}`,
      `DESCRIPTION:${params.description}`,
      `LOCATION:${params.location}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }
}
