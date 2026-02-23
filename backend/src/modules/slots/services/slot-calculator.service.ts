import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  addMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  getDay,
  isAfter,
  isBefore,
  isEqual,
  addHours,
  format,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TimeSlot, DaySlots } from '../interfaces/time-slot.interface';
import { BusyPeriod } from '../../calendar-sync/interfaces/calendar-event.interface';
import { Booking } from '../../booking/entities/booking.entity';

const TIMEZONE = 'Europe/Berlin';

const DAY_NAMES_DE: Record<number, string> = {
  0: 'Sonntag',
  1: 'Montag',
  2: 'Dienstag',
  3: 'Mittwoch',
  4: 'Donnerstag',
  5: 'Freitag',
  6: 'Samstag',
};

@Injectable()
export class SlotCalculatorService {
  private readonly slotDuration: number;
  private readonly dayStartHour: number;
  private readonly dayStartMinute: number;
  private readonly dayEndHour: number;
  private readonly dayEndMinute: number;
  private readonly minAdvanceHours: number;
  private readonly maxAdvanceDays: number;

  constructor(private readonly configService: ConfigService) {
    this.slotDuration = this.configService.get<number>('slot.durationMinutes', 30);
    this.dayStartHour = this.configService.get<number>('slot.dayStartHour', 9);
    this.dayStartMinute = this.configService.get<number>('slot.dayStartMinute', 30);
    this.dayEndHour = this.configService.get<number>('slot.dayEndHour', 16);
    this.dayEndMinute = this.configService.get<number>('slot.dayEndMinute', 0);
    this.minAdvanceHours = this.configService.get<number>('slot.minAdvanceHours', 2);
    this.maxAdvanceDays = this.configService.get<number>('slot.maxAdvanceDays', 14);
  }

  calculateAvailableSlots(
    date: Date,
    busyPeriods: BusyPeriod[],
    existingBookings: Booking[],
  ): DaySlots {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);

    // Weekend check
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        date: dateStr,
        dayOfWeek: DAY_NAMES_DE[dayOfWeek],
        slots: [],
        totalAvailable: 0,
      };
    }

    // Generate all possible slots for the day
    const allSlots = this.generateDaySlots(date);

    // Filter out busy periods from either calendar
    const afterBusyFilter = allSlots.filter(
      (slot) => !busyPeriods.some((busy) => this.overlaps(slot, busy)),
    );

    // Filter out already booked slots
    const afterBookingFilter = afterBusyFilter.filter(
      (slot) =>
        !existingBookings.some(
          (booking) =>
            booking.status !== 'cancelled' &&
            this.overlaps(slot, {
              start: booking.slotStart,
              end: booking.slotEnd,
            }),
        ),
    );

    // Filter out past slots and slots within minimum advance time
    const now = new Date();
    const minBookingTime = addHours(now, this.minAdvanceHours);
    const availableSlots = afterBookingFilter.filter((slot) =>
      isAfter(slot.start, minBookingTime),
    );

    // Limit displayed slots to 1-4 per day for a less crowded appearance
    const limitedSlots = this.limitSlotsPerDay(availableSlots, date);

    return {
      date: dateStr,
      dayOfWeek: DAY_NAMES_DE[dayOfWeek],
      slots: limitedSlots,
      totalAvailable: limitedSlots.length,
    };
  }

  private generateDaySlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];

    let current = setMilliseconds(
      setSeconds(
        setMinutes(
          setHours(date, this.dayStartHour),
          this.dayStartMinute,
        ),
        0,
      ),
      0,
    );

    const dayEnd = setMilliseconds(
      setSeconds(
        setMinutes(
          setHours(date, this.dayEndHour),
          this.dayEndMinute,
        ),
        0,
      ),
      0,
    );

    while (
      isBefore(addMinutes(current, this.slotDuration), dayEnd) ||
      isEqual(addMinutes(current, this.slotDuration), dayEnd)
    ) {
      slots.push({
        start: new Date(current),
        end: addMinutes(current, this.slotDuration),
      });
      current = addMinutes(current, this.slotDuration);
    }

    return slots;
    // Generates: 09:30, 10:00, 10:30, 11:00, 11:30, 12:00,
    //            12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30
    // = 13 slots per day maximum
  }

  /**
   * Limits available slots to 1-4 per day, using a deterministic
   * seed based on the date so results stay consistent within a day.
   * Slots are picked randomly from morning (before 12:00) or
   * afternoon (12:00+) windows.
   */
  private limitSlotsPerDay(slots: TimeSlot[], date: Date): TimeSlot[] {
    if (slots.length <= 1) {
      return slots;
    }

    // Deterministic seed from date string so same day always returns same slots
    const dateStr = format(date, 'yyyy-MM-dd');
    const seed = this.hashCode(dateStr);

    // Pick 1-4 slots (deterministic based on date)
    const count = 1 + (Math.abs(seed) % 4); // 1, 2, 3, or 4
    const target = Math.min(count, slots.length);

    // Split into morning (<12:00) and afternoon (>=12:00)
    const morning = slots.filter((s) => s.start.getHours() < 12);
    const afternoon = slots.filter((s) => s.start.getHours() >= 12);

    // Shuffle both pools deterministically
    const shuffledMorning = this.seededShuffle(morning, seed);
    const shuffledAfternoon = this.seededShuffle(afternoon, seed + 1);

    // Pick from both pools in alternating fashion
    const picked: TimeSlot[] = [];
    let mi = 0;
    let ai = 0;
    // Start with morning or afternoon based on seed
    let preferMorning = seed % 2 === 0;

    while (picked.length < target) {
      if (preferMorning && mi < shuffledMorning.length) {
        picked.push(shuffledMorning[mi++]);
      } else if (!preferMorning && ai < shuffledAfternoon.length) {
        picked.push(shuffledAfternoon[ai++]);
      } else if (mi < shuffledMorning.length) {
        picked.push(shuffledMorning[mi++]);
      } else if (ai < shuffledAfternoon.length) {
        picked.push(shuffledAfternoon[ai++]);
      } else {
        break;
      }
      preferMorning = !preferMorning;
    }

    // Sort by time so display order is chronological
    return picked.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  private seededShuffle(array: TimeSlot[], seed: number): TimeSlot[] {
    const result = [...array];
    let currentSeed = Math.abs(seed);
    for (let i = result.length - 1; i > 0; i--) {
      currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
      const j = currentSeed % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private overlaps(
    slot: TimeSlot,
    period: { start: Date; end: Date },
  ): boolean {
    return (
      isBefore(slot.start, period.end) && isAfter(slot.end, period.start)
    );
  }

  isDateInRange(date: Date): boolean {
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + this.maxAdvanceDays);

    const dateStr = format(date, 'yyyy-MM-dd');
    const todayStr = format(now, 'yyyy-MM-dd');
    const maxStr = format(maxDate, 'yyyy-MM-dd');

    return dateStr >= todayStr && dateStr <= maxStr;
  }
}
