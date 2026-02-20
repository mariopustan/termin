import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.service';
import { BookingLockService } from './services/booking-lock.service';
import { ZoomModule } from '../zoom/zoom.module';
import { CalendarSyncModule } from '../calendar-sync/calendar-sync.module';
import { MailModule } from '../mail/mail.module';
import { SlotsModule } from '../slots/slots.module';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    ZoomModule,
    CalendarSyncModule,
    MailModule,
    SlotsModule,
    ContactModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingLockService],
})
export class BookingModule {}
