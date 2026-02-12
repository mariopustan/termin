import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { format } from 'date-fns';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() dto: CreateBookingDto) {
    const result = await this.bookingService.createBooking(dto);

    return {
      data: {
        bookingId: result.bookingId,
        status: result.status,
        slotStart: result.slotStart.toISOString(),
        slotEnd: result.slotEnd.toISOString(),
        productInterest: result.productInterest,
        zoomJoinUrl: result.zoomJoinUrl,
      },
      message: `Ihr Termin wurde erfolgreich gebucht. Eine Bestaetigung wurde an Ihre E-Mail-Adresse gesendet.`,
    };
  }

  @Get('cancel/:token')
  async getCancellationInfo(@Param('token') token: string) {
    const booking =
      await this.bookingService.getBookingByCancellationToken(token);

    if (!booking) {
      throw new NotFoundException('Buchung nicht gefunden.');
    }

    return {
      data: {
        bookingId: booking.id,
        status: booking.status,
        slotStart: booking.slotStart.toISOString(),
        slotEnd: booking.slotEnd.toISOString(),
        productInterest: booking.productInterest,
        prospectName: `${booking.prospectFirstName} ${booking.prospectLastName}`,
        dateFormatted: format(booking.slotStart, 'dd.MM.yyyy HH:mm'),
      },
    };
  }

  @Post('cancel/:token')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(@Param('token') token: string) {
    await this.bookingService.cancelBooking(token);

    return {
      message: 'Ihr Termin wurde erfolgreich storniert.',
    };
  }
}
