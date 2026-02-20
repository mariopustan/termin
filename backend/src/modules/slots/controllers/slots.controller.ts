import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { parseISO, isValid, addDays, format, eachDayOfInterval } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { de } from 'date-fns/locale';
import { SlotCalculatorService } from '../services/slot-calculator.service';
import { CalendarSyncScheduler } from '../../calendar-sync/services/calendar-sync.scheduler';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';
import { BookingStatus } from '../../booking/interfaces/booking-status.enum';
import { DaySlots, SlotsResponse, SlotsRangeResponse } from '../interfaces/time-slot.interface';

@Controller('slots')
export class SlotsController {
  constructor(
    private readonly slotCalculator: SlotCalculatorService,
    private readonly calendarSync: CalendarSyncScheduler,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  @Get()
  async getSlots(@Query('date') dateStr: string): Promise<SlotsResponse> {
    if (!dateStr) {
      throw new BadRequestException('Parameter "date" ist erforderlich (Format: YYYY-MM-DD)');
    }

    const date = parseISO(dateStr);
    if (!isValid(date)) {
      throw new BadRequestException('Ungültiges Datumsformat. Bitte verwenden Sie YYYY-MM-DD');
    }

    if (!this.slotCalculator.isDateInRange(date)) {
      throw new BadRequestException(
        'Das Datum liegt außerhalb des buchbaren Zeitraums',
      );
    }

    const busyPeriods = await this.calendarSync.getBusyPeriods();

    const dayStart = new Date(dateStr + 'T00:00:00');
    const dayEnd = new Date(dateStr + 'T23:59:59');

    const existingBookings = await this.bookingRepository.find({
      where: {
        slotStart: Between(dayStart, dayEnd),
        status: Not(BookingStatus.CANCELLED),
      },
    });

    const daySlots = this.slotCalculator.calculateAvailableSlots(
      date,
      busyPeriods,
      existingBookings,
    );

    return {
      data: daySlots,
      meta: {
        lastSyncAt: this.calendarSync.getLastSyncAt()?.toISOString() || null,
        timezone: 'Europe/Berlin',
      },
    };
  }

  @Get('available')
  async getAvailableSlots() {
    const tz = 'Europe/Berlin';
    const today = new Date();
    const toDate = addDays(today, 7);

    const busyPeriods = await this.calendarSync.getBusyPeriods();

    const rangeStart = new Date(format(today, 'yyyy-MM-dd') + 'T00:00:00');
    const rangeEnd = new Date(format(toDate, 'yyyy-MM-dd') + 'T23:59:59');

    const existingBookings = await this.bookingRepository.find({
      where: {
        slotStart: Between(rangeStart, rangeEnd),
        status: Not(BookingStatus.CANCELLED),
      },
    });

    const days = eachDayOfInterval({ start: today, end: toDate });

    const options: { day: string; time: string; slotStart: string }[] = [];

    for (const day of days) {
      const daySlots = this.slotCalculator.calculateAvailableSlots(day, busyPeriods, existingBookings);
      for (const slot of daySlots.slots) {
        options.push({
          day: formatInTimeZone(slot.start, tz, 'EEEE, dd. MMMM yyyy', { locale: de }),
          time: formatInTimeZone(slot.start, tz, 'HH:mm') + ' Uhr',
          slotStart: slot.start.toISOString(),
        });
      }
      if (options.length >= 9) break;
    }

    return {
      hinweis: 'Nenne dem Anrufer 2-3 Optionen. Verwende slotStart exakt so beim Buchen.',
      termine: options.slice(0, 9),
    };
  }

  @Get('range')
  async getSlotsRange(
    @Query('from') fromStr: string,
    @Query('to') toStr: string,
  ): Promise<SlotsRangeResponse> {
    if (!fromStr || !toStr) {
      throw new BadRequestException(
        'Parameter "from" und "to" sind erforderlich (Format: YYYY-MM-DD)',
      );
    }

    let fromDate = parseISO(fromStr);
    const toDate = parseISO(toStr);

    if (!isValid(fromDate) || !isValid(toDate)) {
      throw new BadRequestException('Ungültiges Datumsformat');
    }

    // Clamp fromDate to today if it's in the past (e.g. when requesting current week)
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    if (format(fromDate, 'yyyy-MM-dd') < todayStr) {
      fromDate = parseISO(todayStr);
    }

    if (!this.slotCalculator.isDateInRange(toDate)) {
      throw new BadRequestException(
        'Der Zeitraum liegt außerhalb des buchbaren Bereichs',
      );
    }

    // If fromDate is now after toDate, return empty
    if (format(fromDate, 'yyyy-MM-dd') > format(toDate, 'yyyy-MM-dd')) {
      return {
        data: [],
        meta: {
          lastSyncAt: this.calendarSync.getLastSyncAt()?.toISOString() || null,
          timezone: 'Europe/Berlin',
          from: fromStr,
          to: toStr,
        },
      };
    }

    const days = eachDayOfInterval({ start: fromDate, end: toDate });

    if (days.length > 14) {
      throw new BadRequestException('Maximal 14 Tage pro Abfrage');
    }

    const busyPeriods = await this.calendarSync.getBusyPeriods();

    const clampedFromStr = format(fromDate, 'yyyy-MM-dd');
    const rangeStart = new Date(clampedFromStr + 'T00:00:00');
    const rangeEnd = new Date(toStr + 'T23:59:59');

    const existingBookings = await this.bookingRepository.find({
      where: {
        slotStart: Between(rangeStart, rangeEnd),
        status: Not(BookingStatus.CANCELLED),
      },
    });

    const allDaySlots: DaySlots[] = days.map((day) =>
      this.slotCalculator.calculateAvailableSlots(day, busyPeriods, existingBookings),
    );

    return {
      data: allDaySlots,
      meta: {
        lastSyncAt: this.calendarSync.getLastSyncAt()?.toISOString() || null,
        timezone: 'Europe/Berlin',
        from: fromStr,
        to: toStr,
      },
    };
  }
}
