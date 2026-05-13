import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './entities/booking.entity';
import { ShowtimesModule } from '../showtimes/showtimes.module';
import { SeatAvailabilitiesModule } from '../seat_availabilities/seat_availabilities.module';
import { BookingDetailsModule } from '../booking_details/booking_details.module';
import { SeatsModule } from '../seats/seats.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ShowtimesModule,
    SeatAvailabilitiesModule,
    BookingDetailsModule,
    SeatsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule { }
