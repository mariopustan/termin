import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { format, addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { de } from 'date-fns/locale';
import { ProductInterest } from '../../booking/interfaces/booking-status.enum';

const PRODUCT_LABELS: Record<ProductInterest, string> = {
  [ProductInterest.ENTERPRISE_API]: 'Enterprise API',
  [ProductInterest.HR_PAYROLL_INTEGRATION]: 'HR & Payroll Integration',
  [ProductInterest.PORTALE]: 'Mitarbeiter- & Arbeitgeberportal',
  [ProductInterest.PAYROLL_SCANNER]: 'Gehaltsabrechnungs-Scanner',
  [ProductInterest.AI_ACT_TRAINING]: 'EU AI Act Training',
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
    const berlinDate = toZonedTime(data.date, 'Europe/Berlin');
    const dateFormatted = format(berlinDate, "EEEE, dd. MMMM yyyy 'um' HH:mm 'Uhr'", {
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
      data.date,
    );

    try {
      await this.transporter.sendMail({
        from: `"IT Warehouse AG" <${this.fromAddress}>`,
        to: data.to,
        subject: `Terminbestaetigung: ${productLabel} Demo am ${format(berlinDate, 'dd.MM.yyyy')}`,
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

    const berlinDate = toZonedTime(data.date, 'Europe/Berlin');
    const dateFormatted = format(berlinDate, "dd.MM.yyyy 'um' HH:mm 'Uhr'", {
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
    slotStart: Date,
  ): string {
    const slotEnd = addMinutes(slotStart, 30);
    const calendarUrls = this.buildCalendarUrls(
      `IT Warehouse Demo: ${productLabel}`,
      slotStart,
      slotEnd,
      `Zoom-Meeting: ${zoomJoinUrl}`,
      zoomJoinUrl,
    );

    return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Terminbest&auml;tigung</title>
</head>
<body style="margin:0;padding:0;background-color:#060b18;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Preheader (hidden preview text) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  Ihr Termin: ${dateFormatted} &ndash; ${productLabel} Demo mit IT Warehouse AG
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#060b18;padding:0;">
<tr><td align="center" style="padding:32px 16px;">

<!-- Main Container -->
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

<!-- ============================================ -->
<!-- HEADER with gradient overlay                 -->
<!-- ============================================ -->
<tr><td style="background:linear-gradient(135deg,#0f1b2e 0%,#1a2a42 50%,#0f1b2e 100%);border-radius:20px 20px 0 0;padding:48px 40px 32px;text-align:center;border-bottom:1px solid rgba(232,122,30,0.3);">
  <!-- Logo mark -->
  <table cellpadding="0" cellspacing="0" border="0" align="center">
  <tr>
    <td style="width:48px;height:48px;background:linear-gradient(135deg,#e87a1e,#f59e42);border-radius:12px;text-align:center;vertical-align:middle;font-size:24px;line-height:48px;">
      &#9670;
    </td>
  </tr>
  </table>
  <h1 style="color:#ffffff;margin:16px 0 0;font-size:24px;font-weight:700;letter-spacing:-0.3px;">IT Warehouse AG</h1>
  <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Terminbest&auml;tigung</p>
</td></tr>

<!-- ============================================ -->
<!-- GREETING                                     -->
<!-- ============================================ -->
<tr><td style="background-color:#111c2e;padding:40px 40px 0;">
  <p style="color:#ffffff;font-size:18px;line-height:1.5;margin:0 0 8px;font-weight:600;">
    Hallo ${firstName},
  </p>
  <p style="color:rgba(255,255,255,0.65);font-size:15px;line-height:1.7;margin:0 0 32px;">
    vielen Dank f&uuml;r Ihre Buchung! Wir freuen uns auf das Gespr&auml;ch &uuml;ber <strong style="color:#f59e42;">${productLabel}</strong>.
  </p>
</td></tr>

<!-- ============================================ -->
<!-- APPOINTMENT CARD (Glassmorphism)             -->
<!-- ============================================ -->
<tr><td style="background-color:#111c2e;padding:0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,rgba(232,122,30,0.08) 0%,rgba(245,158,66,0.04) 100%);border-radius:16px;border:1px solid rgba(232,122,30,0.2);">
  <tr><td style="padding:28px 28px 24px;">

    <!-- Date row -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="width:44px;vertical-align:top;">
        <div style="width:44px;height:44px;background:rgba(232,122,30,0.15);border-radius:10px;text-align:center;line-height:44px;font-size:20px;">&#128197;</div>
      </td>
      <td style="padding-left:16px;vertical-align:top;">
        <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Ihr Termin</p>
        <p style="color:#ffffff;font-size:18px;font-weight:700;margin:0;line-height:1.4;">${dateFormatted}</p>
      </td>
    </tr>
    </table>

    <!-- Divider -->
    <div style="height:1px;background:rgba(255,255,255,0.08);margin:20px 0;"></div>

    <!-- Details row -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="width:50%;vertical-align:top;">
        <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Produkt</p>
        <p style="color:#f59e42;font-size:14px;font-weight:600;margin:0;">${productLabel}</p>
      </td>
      <td style="width:50%;vertical-align:top;">
        <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Dauer</p>
        <p style="color:#ffffff;font-size:14px;font-weight:600;margin:0;">30 Minuten</p>
      </td>
    </tr>
    </table>

  </td></tr>
  </table>
</td></tr>

<!-- ============================================ -->
<!-- ZOOM CTA BUTTON                              -->
<!-- ============================================ -->
<tr><td style="background-color:#111c2e;padding:28px 40px 0;" align="center">
  <table cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center" style="background:linear-gradient(135deg,#e87a1e 0%,#d16a12 100%);border-radius:12px;">
    <a href="${zoomJoinUrl}" target="_blank" style="display:inline-block;color:#ffffff;text-decoration:none;padding:16px 48px;font-size:16px;font-weight:700;letter-spacing:0.3px;border-radius:12px;border:0;">
      &#127909;&ensp;Zoom-Meeting beitreten
    </a>
  </td></tr>
  </table>
  <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:12px 0 0;word-break:break-all;">
    <a href="${zoomJoinUrl}" style="color:rgba(140,206,217,0.7);text-decoration:none;">${zoomJoinUrl}</a>
  </p>
</td></tr>

<!-- ============================================ -->
<!-- CALENDAR BUTTONS                             -->
<!-- ============================================ -->
<tr><td style="background-color:#111c2e;padding:28px 40px 0;">
  <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;text-align:center;">Zum Kalender hinzuf&uuml;gen</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <!-- Google Calendar -->
    <td width="33%" align="center" style="padding:0 4px;">
      <a href="${calendarUrls.google}" target="_blank" style="display:block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 8px;text-decoration:none;color:#ffffff;font-size:12px;font-weight:600;text-align:center;">
        &#128197; Google
      </a>
    </td>
    <!-- Outlook -->
    <td width="33%" align="center" style="padding:0 4px;">
      <a href="${calendarUrls.outlook}" target="_blank" style="display:block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 8px;text-decoration:none;color:#ffffff;font-size:12px;font-weight:600;text-align:center;">
        &#128231; Outlook
      </a>
    </td>
    <!-- ICS Download -->
    <td width="33%" align="center" style="padding:0 4px;">
      <div style="display:block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 8px;text-align:center;color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;">
        &#128229; ICS-Datei*
      </div>
    </td>
  </tr>
  </table>
  <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:8px 0 0;text-align:center;">
    * Die ICS-Datei ist dieser E-Mail als Anhang beigef&uuml;gt.
  </p>
</td></tr>

<!-- ============================================ -->
<!-- PREPARATION TIPS                             -->
<!-- ============================================ -->
<tr><td style="background-color:#111c2e;padding:32px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
  <tr><td style="padding:20px 24px;">
    <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">So bereiten Sie sich vor</p>
    <table cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding:4px 0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;">
        <span style="color:#f59e42;">&#10003;</span>&ensp;Zoom-Client installiert oder Browser bereit
      </td>
    </tr>
    <tr>
      <td style="padding:4px 0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;">
        <span style="color:#f59e42;">&#10003;</span>&ensp;Stabile Internetverbindung sicherstellen
      </td>
    </tr>
    <tr>
      <td style="padding:4px 0;color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;">
        <span style="color:#f59e42;">&#10003;</span>&ensp;Fragen zu ${productLabel} notieren
      </td>
    </tr>
    </table>
  </td></tr>
  </table>
</td></tr>

<!-- ============================================ -->
<!-- EU AI ACT TRAINING BANNER                    -->
<!-- ============================================ -->
<tr><td style="background-color:#111c2e;padding:32px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#1a1230 0%,#2a1540 50%,#1a1230 100%);border-radius:16px;border:1px solid rgba(168,85,247,0.25);overflow:hidden;">
  <tr><td style="padding:32px 28px;">

    <!-- Badge -->
    <table cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:rgba(168,85,247,0.2);border-radius:20px;padding:4px 14px;">
      <p style="color:#c084fc;font-size:11px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:1px;">&#9733; Empfehlung</p>
    </td></tr>
    </table>

    <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:16px 0 8px;line-height:1.3;">EU AI Act Training</h2>
    <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.7;margin:0 0 20px;">
      Der EU AI Act ist seit August 2024 in Kraft &ndash; kennen Sie Ihre Pflichten? In unserem praxisorientierten Workshop lernen Sie:
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
    <tr>
      <td style="padding:5px 0;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.5;">
        <span style="color:#c084fc;">&#9679;</span>&ensp;Risikoklassifizierung Ihrer KI-Systeme
      </td>
    </tr>
    <tr>
      <td style="padding:5px 0;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.5;">
        <span style="color:#c084fc;">&#9679;</span>&ensp;Compliance-Anforderungen &amp; Fristen
      </td>
    </tr>
    <tr>
      <td style="padding:5px 0;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.5;">
        <span style="color:#c084fc;">&#9679;</span>&ensp;Technische Dokumentation &amp; Zertifizierung
      </td>
    </tr>
    <tr>
      <td style="padding:5px 0;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.5;">
        <span style="color:#c084fc;">&#9679;</span>&ensp;Praxisbeispiele aus Ihrer Branche
      </td>
    </tr>
    </table>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:linear-gradient(135deg,#9333ea 0%,#7c3aed 100%);border-radius:10px;">
      <a href="https://eu-ai-act-training.eu" target="_blank" style="display:inline-block;color:#ffffff;text-decoration:none;padding:13px 32px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
        Mehr erfahren &rarr;
      </a>
    </td></tr>
    </table>

  </td></tr>
  </table>
</td></tr>

<!-- ============================================ -->
<!-- CANCELLATION                                 -->
<!-- ============================================ -->
<tr><td style="background-color:#111c2e;padding:32px 40px;">
  <div style="height:1px;background:rgba(255,255,255,0.06);margin:0 0 24px;"></div>
  <p style="color:rgba(255,255,255,0.35);font-size:13px;line-height:1.6;margin:0;text-align:center;">
    M&uuml;ssen Sie den Termin absagen?
    <a href="${cancellationUrl}" style="color:#8cced9;text-decoration:underline;">Termin stornieren</a>
  </p>
</td></tr>

<!-- ============================================ -->
<!-- FOOTER                                       -->
<!-- ============================================ -->
<tr><td style="background:linear-gradient(180deg,#0a1525 0%,#060b18 100%);border-radius:0 0 20px 20px;padding:32px 40px;border-top:1px solid rgba(255,255,255,0.04);">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center">
    <p style="color:rgba(255,255,255,0.5);font-size:13px;font-weight:600;margin:0 0 6px;">IT Warehouse AG</p>
    <p style="color:rgba(255,255,255,0.3);font-size:12px;line-height:1.6;margin:0 0 16px;">Hamburg, Deutschland</p>
    <p style="margin:0;font-size:12px;">
      <a href="https://www.it-warehouse.de" style="color:#8cced9;text-decoration:none;">Website</a>
      <span style="color:rgba(255,255,255,0.15);padding:0 8px;">&middot;</span>
      <a href="https://www.it-warehouse.de/datenschutz" style="color:rgba(255,255,255,0.35);text-decoration:none;">Datenschutz</a>
      <span style="color:rgba(255,255,255,0.15);padding:0 8px;">&middot;</span>
      <a href="https://www.it-warehouse.de/impressum" style="color:rgba(255,255,255,0.35);text-decoration:none;">Impressum</a>
    </p>
  </td></tr>
  </table>
</td></tr>

</table>
<!-- /Main Container -->

</td></tr>
</table>
</body>
</html>`;
  }

  private buildCalendarUrls(
    summary: string,
    start: Date,
    end: Date,
    description: string,
    location: string,
  ): { google: string; outlook: string } {
    const formatGoogleDate = (d: Date): string =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const google = `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(summary)}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

    const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(summary)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

    return { google, outlook };
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
