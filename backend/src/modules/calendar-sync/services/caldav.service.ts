import { Injectable, Logger } from '@nestjs/common';
import { DAVClient, DAVCalendar, DAVCalendarObject } from 'tsdav';

export interface CalDavConnectionConfig {
  serverUrl: string;
  username: string;
  password: string;
  authMethod?: 'Basic' | 'Digest';
}

@Injectable()
export class CalDavService {
  private readonly logger = new Logger(CalDavService.name);

  async createClient(config: CalDavConnectionConfig): Promise<DAVClient> {
    const client = new DAVClient({
      serverUrl: config.serverUrl,
      credentials: {
        username: config.username,
        password: config.password,
      },
      authMethod: config.authMethod || 'Basic',
      defaultAccountType: 'caldav',
    });

    await client.login();
    return client;
  }

  async getCalendars(client: DAVClient): Promise<DAVCalendar[]> {
    const calendars = await client.fetchCalendars();
    return calendars;
  }

  async findCalendar(
    client: DAVClient,
    calendarName: string,
  ): Promise<DAVCalendar | undefined> {
    const calendars = await this.getCalendars(client);
    return calendars.find(
      (cal) =>
        (typeof cal.displayName === 'string' && cal.displayName.toLowerCase() === calendarName.toLowerCase()) ||
        cal.url.includes(calendarName),
    );
  }

  async fetchCalendarObjects(
    client: DAVClient,
    calendar: DAVCalendar,
    timeRange: { start: string; end: string },
  ): Promise<DAVCalendarObject[]> {
    const objects = await client.fetchCalendarObjects({
      calendar,
      timeRange: {
        start: timeRange.start,
        end: timeRange.end,
      },
    });
    return objects;
  }

  async createCalendarEvent(
    client: DAVClient,
    calendar: DAVCalendar,
    vcalendarData: string,
    filename: string,
  ): Promise<void> {
    await client.createCalendarObject({
      calendar,
      filename: `${filename}.ics`,
      iCalString: vcalendarData,
    });
    this.logger.log(`Calendar event created: ${filename}`);
  }

  async deleteCalendarEvent(
    client: DAVClient,
    calendarObject: DAVCalendarObject,
  ): Promise<void> {
    await client.deleteCalendarObject({
      calendarObject,
    });
    this.logger.log(`Calendar event deleted: ${calendarObject.url}`);
  }
}
