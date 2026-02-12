import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DAVClient, DAVCalendar } from 'tsdav';
import { CalDavService } from './caldav.service';
import { EventParserService } from './event-parser.service';
import {
  BusyPeriod,
  CalendarSource,
} from '../interfaces/calendar-event.interface';

@Injectable()
export class ICloudCalendarService implements OnModuleInit {
  private readonly logger = new Logger(ICloudCalendarService.name);
  private client: DAVClient | null = null;
  private calendar: DAVCalendar | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly caldavService: CalDavService,
    private readonly eventParser: EventParserService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.connect();
    } catch (error) {
      this.logger.error('Failed to connect to iCloud CalDAV on startup', error);
    }
  }

  private async connect(): Promise<void> {
    const username = this.configService.get<string>('caldav.icloud.username');
    const password = this.configService.get<string>('caldav.icloud.password');
    const calendarName = this.configService.get<string>('caldav.icloud.calendarName');

    if (!username || !password) {
      this.logger.warn('iCloud CalDAV credentials not configured');
      return;
    }

    this.client = await this.caldavService.createClient({
      serverUrl: 'https://caldav.icloud.com',
      username,
      password,
    });

    if (calendarName) {
      this.calendar = await this.caldavService.findCalendar(
        this.client,
        calendarName,
      ) || null;

      if (this.calendar) {
        this.logger.log(`Connected to iCloud calendar: ${this.calendar.displayName}`);
      } else {
        this.logger.warn(`Calendar "${calendarName}" not found in iCloud`);
      }
    } else {
      const calendars = await this.caldavService.getCalendars(this.client);
      if (calendars.length > 0) {
        this.calendar = calendars[0];
        this.logger.log(
          `Connected to default iCloud calendar: ${this.calendar.displayName}`,
        );
      }
    }
  }

  async ensureConnected(): Promise<void> {
    if (!this.client || !this.calendar) {
      await this.connect();
    }
  }

  async fetchBusyPeriods(start: Date, end: Date): Promise<BusyPeriod[]> {
    await this.ensureConnected();

    if (!this.client || !this.calendar) {
      this.logger.warn('iCloud calendar not available, returning empty busy periods');
      return [];
    }

    const calendarObjects = await this.caldavService.fetchCalendarObjects(
      this.client,
      this.calendar,
      {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    );

    const allEvents = calendarObjects.flatMap((obj) => {
      if (!obj.data) return [];
      return this.eventParser.parseVCalendar(
        obj.data as string,
        CalendarSource.ICLOUD,
      );
    });

    return this.eventParser.eventsToBusyPeriods(allEvents);
  }

  isConfigured(): boolean {
    const username = this.configService.get<string>('caldav.icloud.username');
    return !!username;
  }
}
