import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { addMinutes, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Booking } from '../entities/booking.entity';
import { BookingStatus, ProductInterest } from '../interfaces/booking-status.enum';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingLockService } from './booking-lock.service';
import { ZoomMeetingService } from '../../zoom/services/zoom-meeting.service';
import { NextcloudCalendarService } from '../../calendar-sync/services/nextcloud-calendar.service';
import { MailService } from '../../mail/services/mail.service';
import { CalendarSyncScheduler } from '../../calendar-sync/services/calendar-sync.scheduler';
import { SlotCalculatorService } from '../../slots/services/slot-calculator.service';
import { ContactService } from '../../contact/services/contact.service';

export interface BookingResult {
  bookingId: string;
  status: BookingStatus;
  slotStart: Date;
  slotEnd: Date;
  productInterest: ProductInterest;
  zoomJoinUrl: string;
}

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly dataSource: DataSource,
    private readonly lockService: BookingLockService,
    private readonly zoomService: ZoomMeetingService,
    private readonly nextcloudService: NextcloudCalendarService,
    private readonly mailService: MailService,
    private readonly calendarSync: CalendarSyncScheduler,
    private readonly slotCalculator: SlotCalculatorService,
    private readonly contactService: ContactService,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<BookingResult> {
    const slotStart = parseISO(dto.slotStart);
    const slotEnd = addMinutes(slotStart, 30);

    // Validate the slot is in range
    if (!this.slotCalculator.isDateInRange(slotStart)) {
      throw new BadRequestException(
        'Der gewählte Termin liegt außerhalb des buchbaren Zeitraums.',
      );
    }

    const slotKey = `booking:${slotStart.toISOString()}`;

    // 1. Acquire distributed lock
    const lockAcquired = await this.lockService.acquire(slotKey, 30000);
    if (!lockAcquired) {
      throw new ConflictException(
        'Dieser Termin wird gerade von einer anderen Person gebucht. Bitte wählen Sie einen anderen Zeitpunkt.',
      );
    }

    try {
      // 2. Double-check availability inside lock
      const existingBooking = await this.bookingRepository.findOne({
        where: {
          slotStart,
          status: Not(BookingStatus.CANCELLED),
        },
      });

      if (existingBooking) {
        throw new ConflictException(
          'Dieser Termin ist leider nicht mehr verfügbar. Bitte wählen Sie einen anderen Zeitpunkt.',
        );
      }

      // 3. Create Zoom meeting
      const productLabel = this.getProductLabel(dto.productInterest);
      const zoomMeeting = await this.zoomService.createMeeting({
        topic: `IT Warehouse Demo: ${productLabel}`,
        startTime: slotStart,
        duration: 30,
        timezone: 'Europe/Berlin',
      });

      // 4. Save booking in database transaction
      const cancellationToken = uuidv4();

      const booking = await this.dataSource.transaction(async (manager) => {
        const newBooking = manager.create(Booking, {
          slotStart,
          slotEnd,
          prospectFirstName: dto.firstName,
          prospectLastName: dto.lastName,
          prospectCompany: dto.companyName,
          prospectEmail: dto.email,
          prospectPhone: dto.phone,
          prospectMessage: dto.message || null,
          productInterest: dto.productInterest,
          zoomMeetingId: String(zoomMeeting.id),
          zoomJoinUrl: zoomMeeting.join_url,
          zoomStartUrl: zoomMeeting.start_url,
          zoomPassword: zoomMeeting.password,
          status: BookingStatus.CONFIRMED,
          consentGiven: dto.consentGiven,
          consentTimestamp: new Date(),
          privacyPolicyVersion: '1.0',
          cancellationToken,
        });
        return manager.save(newBooking);
      });

      // 5. Create calendar event in Nextcloud
      try {
        const calendarUid = await this.nextcloudService.createEvent({
          summary: `Demo: ${dto.companyName} - ${dto.firstName} ${dto.lastName} (${productLabel})`,
          description: `Zoom: ${zoomMeeting.join_url}\nTelefon: ${dto.phone}\nE-Mail: ${dto.email}${dto.message ? `\nNachricht: ${dto.message}` : ''}`,
          start: slotStart,
          end: slotEnd,
          location: zoomMeeting.join_url,
        });

        await this.bookingRepository.update(booking.id, {
          calendarEventUid: calendarUid,
        });
      } catch (error) {
        this.logger.error('Failed to create Nextcloud calendar event', error);
      }

      // 6. Send confirmation email to prospect
      try {
        await this.mailService.sendBookingConfirmation({
          to: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          company: dto.companyName,
          date: slotStart,
          zoomJoinUrl: zoomMeeting.join_url,
          productInterest: dto.productInterest,
          cancellationToken,
        });
      } catch (error) {
        this.logger.error('Failed to send confirmation email', error);
      }

      // 7. Send internal notification
      try {
        await this.mailService.sendInternalNotification({
          firstName: dto.firstName,
          lastName: dto.lastName,
          company: dto.companyName,
          email: dto.email,
          phone: dto.phone,
          date: slotStart,
          productInterest: dto.productInterest,
          zoomStartUrl: zoomMeeting.start_url,
          message: dto.message,
        });
      } catch (error) {
        this.logger.error('Failed to send internal notification', error);
      }

      // 8. Invalidate slot cache
      await this.calendarSync.invalidateCache();

      // 9. Save/update contact for caller recognition
      try {
        await this.contactService.createOrUpdateFromBooking(
          dto.phone,
          dto.firstName,
          dto.lastName,
          dto.companyName,
          dto.email,
        );
      } catch (error) {
        this.logger.error('Failed to save contact', error);
      }

      this.logger.log(
        `Booking created: ${booking.id} for ${dto.email} at ${slotStart.toISOString()}`,
      );

      return {
        bookingId: booking.id,
        status: booking.status,
        slotStart: booking.slotStart,
        slotEnd: booking.slotEnd,
        productInterest: booking.productInterest,
        zoomJoinUrl: zoomMeeting.join_url,
      };
    } finally {
      // 10. Always release the lock
      await this.lockService.release(slotKey);
    }
  }

  async cancelBooking(cancellationToken: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { cancellationToken, status: BookingStatus.CONFIRMED },
    });

    if (!booking) {
      throw new BadRequestException(
        'Buchung nicht gefunden oder bereits storniert.',
      );
    }

    // Cancel Zoom meeting
    if (booking.zoomMeetingId) {
      try {
        await this.zoomService.deleteMeeting(booking.zoomMeetingId);
      } catch (error) {
        this.logger.error('Failed to delete Zoom meeting', error);
      }
    }

    // Update booking status
    await this.bookingRepository.update(booking.id, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    // Invalidate slot cache so the slot becomes available again
    await this.calendarSync.invalidateCache();

    this.logger.log(`Booking cancelled: ${booking.id}`);
  }

  async getBookingByCancellationToken(
    token: string,
  ): Promise<Booking | null> {
    return this.bookingRepository.findOne({
      where: { cancellationToken: token },
    });
  }

  private getProductLabel(interest: ProductInterest): string {
    const labels: Record<ProductInterest, string> = {
      [ProductInterest.ENTERPRISE_API]: 'Enterprise API',
      [ProductInterest.HR_PAYROLL_INTEGRATION]: 'HR & Payroll Integration',
      [ProductInterest.PORTALE]: 'Mitarbeiter- & Arbeitgeberportal',
      [ProductInterest.PAYROLL_SCANNER]: 'Gehaltsabrechnungs-Scanner',
      [ProductInterest.AI_ACT_TRAINING]: 'EU AI Act Training',
    };
    return labels[interest] || interest;
  }
}
