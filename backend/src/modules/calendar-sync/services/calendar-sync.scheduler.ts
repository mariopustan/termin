import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addDays } from 'date-fns';
import { NextcloudCalendarService } from './nextcloud-calendar.service';
import { ICloudCalendarService } from './icloud-calendar.service';
import { BusyPeriod } from '../interfaces/calendar-event.interface';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

const BUSY_PERIODS_KEY = 'salesfunnel:busy_periods';

@Injectable()
export class CalendarSyncScheduler {
  private readonly logger = new Logger(CalendarSyncScheduler.name);
  private redis: Redis;
  private lastSyncAt: Date | null = null;
  private consecutiveErrors = 0;

  constructor(
    private readonly nextcloudService: NextcloudCalendarService,
    private readonly icloudService: ICloudCalendarService,
    private readonly configService: ConfigService,
  ) {
    const redisHost = this.configService.get<string>('redis.host', 'localhost');
    const redisPort = this.configService.get<number>('redis.port', 6379);
    const redisPassword = this.configService.get<string>('redis.password', '');

    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 1000, 30000),
    });
  }

  @Cron('*/30 * * * *')
  async syncCalendars(): Promise<void> {
    this.logger.log('Starting calendar sync...');
    const startTime = Date.now();

    try {
      const lookAheadDays = this.configService.get<number>(
        'caldav.lookAheadDays',
        14,
      );
      const now = new Date();
      const endDate = addDays(now, lookAheadDays);

      const [nextcloudPeriods, icloudPeriods] = await Promise.allSettled([
        this.nextcloudService.fetchBusyPeriods(now, endDate),
        this.icloudService.fetchBusyPeriods(now, endDate),
      ]);

      const allBusyPeriods: BusyPeriod[] = [];

      if (nextcloudPeriods.status === 'fulfilled') {
        allBusyPeriods.push(...nextcloudPeriods.value);
      } else {
        this.logger.error('Nextcloud sync failed', nextcloudPeriods.reason);
      }

      if (icloudPeriods.status === 'fulfilled') {
        allBusyPeriods.push(...icloudPeriods.value);
      } else {
        this.logger.error('iCloud sync failed', icloudPeriods.reason);
      }

      const serialized = JSON.stringify(
        allBusyPeriods.map((bp) => ({
          start: bp.start.toISOString(),
          end: bp.end.toISOString(),
          source: bp.source,
          eventUid: bp.eventUid,
        })),
      );

      await this.redis.set(BUSY_PERIODS_KEY, serialized, 'EX', 2100);

      this.lastSyncAt = new Date();
      this.consecutiveErrors = 0;

      const duration = Date.now() - startTime;
      this.logger.log(
        `Calendar sync completed in ${duration}ms. ` +
        `${allBusyPeriods.length} busy periods cached ` +
        `(Nextcloud: ${nextcloudPeriods.status === 'fulfilled' ? nextcloudPeriods.value.length : 'error'}, ` +
        `iCloud: ${icloudPeriods.status === 'fulfilled' ? icloudPeriods.value.length : 'error'})`,
      );
    } catch (error) {
      this.consecutiveErrors++;
      this.logger.error(
        `Calendar sync failed (consecutive errors: ${this.consecutiveErrors})`,
        error,
      );
    }
  }

  async getBusyPeriods(): Promise<BusyPeriod[]> {
    try {
      const data = await this.redis.get(BUSY_PERIODS_KEY);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data) as Array<{
        start: string;
        end: string;
        source: string;
        eventUid?: string;
      }>;

      return parsed.map((bp) => ({
        start: new Date(bp.start),
        end: new Date(bp.end),
        source: bp.source as BusyPeriod['source'],
        eventUid: bp.eventUid,
      }));
    } catch (error) {
      this.logger.error('Failed to get busy periods from cache', error);
      return [];
    }
  }

  async invalidateCache(): Promise<void> {
    await this.redis.del(BUSY_PERIODS_KEY);
  }

  getLastSyncAt(): Date | null {
    return this.lastSyncAt;
  }

  getConsecutiveErrors(): number {
    return this.consecutiveErrors;
  }
}
