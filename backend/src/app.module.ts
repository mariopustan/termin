import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import {
  appConfig,
  databaseConfig,
  redisConfig,
  caldavConfig,
  zoomConfig,
  mailConfig,
  slotConfig,
} from './common/config';
import { Booking } from './modules/booking/entities/booking.entity';
import { HealthModule } from './modules/health/health.module';
import { CalendarSyncModule } from './modules/calendar-sync/calendar-sync.module';
import { SlotsModule } from './modules/slots/slots.module';
import { BookingModule } from './modules/booking/booking.module';
import { ZoomModule } from './modules/zoom/zoom.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        caldavConfig,
        zoomConfig,
        mailConfig,
        slotConfig,
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [Booking],
        synchronize: true,
        logging: config.get<string>('app.environment') === 'development',
        ssl: false,
      }),
    }),

    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),

    ScheduleModule.forRoot(),

    HealthModule,
    CalendarSyncModule,
    SlotsModule,
    ZoomModule,
    MailModule,
    BookingModule,
  ],
})
export class AppModule {}
