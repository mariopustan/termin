import { Injectable, Logger } from '@nestjs/common';
import ICAL from 'ical.js';
import {
  CalendarEvent,
  BusyPeriod,
  CalendarSource,
} from '../interfaces/calendar-event.interface';

@Injectable()
export class EventParserService {
  private readonly logger = new Logger(EventParserService.name);

  parseVCalendar(
    icalData: string,
    source: CalendarSource,
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    try {
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      for (const vevent of vevents) {
        const event = new ICAL.Event(vevent);

        if (event.isRecurring()) {
          const expandedEvents = this.expandRecurringEvent(event, source);
          events.push(...expandedEvents);
        } else {
          const calEvent = this.parseSingleEvent(event, source);
          if (calEvent) {
            events.push(calEvent);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to parse iCal data from ${source}`, error);
    }

    return events;
  }

  private parseSingleEvent(
    event: ICAL.Event,
    source: CalendarSource,
  ): CalendarEvent | null {
    try {
      const startDate = event.startDate;
      const endDate = event.endDate;

      if (!startDate || !endDate) {
        return null;
      }

      const isAllDay = startDate.isDate;

      return {
        uid: event.uid,
        summary: event.summary || '(Kein Titel)',
        start: startDate.toJSDate(),
        end: endDate.toJSDate(),
        isAllDay,
        source,
      };
    } catch (error) {
      this.logger.warn(`Failed to parse event: ${error}`);
      return null;
    }
  }

  private expandRecurringEvent(
    event: ICAL.Event,
    source: CalendarSource,
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const now = new Date();
    const lookAheadEnd = new Date();
    lookAheadEnd.setDate(lookAheadEnd.getDate() + 30);

    try {
      const iterator = event.iterator();
      let next: ICAL.Time | null = iterator.next();
      let count = 0;
      const maxOccurrences = 100;

      while (next && count < maxOccurrences) {
        const occurrence = next.toJSDate();

        if (occurrence > lookAheadEnd) {
          break;
        }

        if (occurrence >= now) {
          const duration = event.duration;
          const endDate = new Date(
            occurrence.getTime() + (duration ? duration.toSeconds() * 1000 : 30 * 60 * 1000),
          );

          events.push({
            uid: `${event.uid}_${occurrence.toISOString()}`,
            summary: event.summary || '(Kein Titel)',
            start: occurrence,
            end: endDate,
            isAllDay: event.startDate.isDate,
            source,
          });
        }

        next = iterator.next();
        count++;
      }
    } catch (error) {
      this.logger.warn(`Failed to expand recurring event: ${event.uid}`, error);
    }

    return events;
  }

  eventsToBusyPeriods(events: CalendarEvent[]): BusyPeriod[] {
    return events.map((event) => ({
      start: event.start,
      end: event.end,
      source: event.source,
      eventUid: event.uid,
      eventSummary: event.summary,
    }));
  }

  buildVCalendarEvent(params: {
    uid: string;
    summary: string;
    description: string;
    start: Date;
    end: Date;
    location?: string;
    timezone: string;
  }): string {
    const formatDate = (date: Date): string => {
      return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
    };

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SalesFunnel//Booking//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${params.uid}`,
      `DTSTART;TZID=${params.timezone}:${formatDate(params.start)}`,
      `DTEND;TZID=${params.timezone}:${formatDate(params.end)}`,
      `SUMMARY:${params.summary}`,
      `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
      params.location ? `LOCATION:${params.location}` : '',
      `DTSTAMP:${formatDate(new Date())}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');
  }
}
