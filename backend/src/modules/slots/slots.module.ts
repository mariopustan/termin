import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotsController } from './controllers/slots.controller';
import { SlotCalculatorService } from './services/slot-calculator.service';
import { CalendarSyncModule } from '../calendar-sync/calendar-sync.module';
import { Booking } from '../booking/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    CalendarSyncModule,
  ],
  controllers: [SlotsController],
  providers: [SlotCalculatorService],
  exports: [SlotCalculatorService],
})
export class SlotsModule {}
