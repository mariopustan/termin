import { Module } from '@nestjs/common';
import { CalDavService } from './services/caldav.service';
import { EventParserService } from './services/event-parser.service';
import { NextcloudCalendarService } from './services/nextcloud-calendar.service';
import { ICloudCalendarService } from './services/icloud-calendar.service';
import { CalendarSyncScheduler } from './services/calendar-sync.scheduler';

@Module({
  providers: [
    CalDavService,
    EventParserService,
    NextcloudCalendarService,
    ICloudCalendarService,
    CalendarSyncScheduler,
  ],
  exports: [
    NextcloudCalendarService,
    CalendarSyncScheduler,
  ],
})
export class CalendarSyncModule {}
