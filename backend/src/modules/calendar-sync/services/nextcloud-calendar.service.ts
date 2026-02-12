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
export class NextcloudCalendarService implements OnModuleInit {
  private readonly logger = new Logger(NextcloudCalendarService.name);
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
      this.logger.error('Failed to connect to Nextcloud CalDAV on startup', error);
    }
  }

  private async connect(): Promise<void> {
    const serverUrl = this.configService.get<string>('caldav.nextcloud.serverUrl');
    const username = this.configService.get<string>('caldav.nextcloud.username');
    const password = this.configService.get<string>('caldav.nextcloud.password');
    const calendarName = this.configService.get<string>('caldav.nextcloud.calendarName');

    if (!serverUrl || !username || !password) {
      this.logger.warn('Nextcloud CalDAV credentials not configured');
      return;
    }

    this.client = await this.caldavService.createClient({
      serverUrl,
      username,
      password,
    });

    if (calendarName) {
      this.calendar = await this.caldavService.findCalendar(
        this.client,
        calendarName,
      ) || null;

      if (this.calendar) {
        this.logger.log(`Connected to Nextcloud calendar: ${this.calendar.displayName}`);
      } else {
        this.logger.warn(`Calendar "${calendarName}" not found in Nextcloud`);
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
      this.logger.warn('Nextcloud calendar not available, returning empty busy periods');
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
        CalendarSource.NEXTCLOUD,
      );
    });

    return this.eventParser.eventsToBusyPeriods(allEvents);
  }

  async createEvent(params: {
    summary: string;
    description: string;
    start: Date;
    end: Date;
    location?: string;
  }): Promise<string> {
    await this.ensureConnected();

    if (!this.client || !this.calendar) {
      throw new Error('Nextcloud calendar not available');
    }

    const uid = `salesfunnel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const vcalendarData = this.eventParser.buildVCalendarEvent({
      uid,
      summary: params.summary,
      description: params.description,
      start: params.start,
      end: params.end,
      location: params.location,
      timezone: 'Europe/Berlin',
    });

    await this.caldavService.createCalendarEvent(
      this.client,
      this.calendar,
      vcalendarData,
      uid,
    );

    return uid;
  }

  isConfigured(): boolean {
    const serverUrl = this.configService.get<string>('caldav.nextcloud.serverUrl');
    return !!serverUrl;
  }
}
