import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { parseISO, isValid, addDays, format, eachDayOfInterval } from 'date-fns';
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
      throw new BadRequestException('Ungueltiges Datumsformat. Bitte verwenden Sie YYYY-MM-DD');
    }

    if (!this.slotCalculator.isDateInRange(date)) {
      throw new BadRequestException(
        'Das Datum liegt ausserhalb des buchbaren Zeitraums',
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

    const fromDate = parseISO(fromStr);
    const toDate = parseISO(toStr);

    if (!isValid(fromDate) || !isValid(toDate)) {
      throw new BadRequestException('Ungueltiges Datumsformat');
    }

    if (!this.slotCalculator.isDateInRange(fromDate) || !this.slotCalculator.isDateInRange(toDate)) {
      throw new BadRequestException(
        'Der Zeitraum liegt ausserhalb des buchbaren Bereichs',
      );
    }

    const days = eachDayOfInterval({ start: fromDate, end: toDate });

    if (days.length > 14) {
      throw new BadRequestException('Maximal 14 Tage pro Abfrage');
    }

    const busyPeriods = await this.calendarSync.getBusyPeriods();

    const rangeStart = new Date(fromStr + 'T00:00:00');
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
