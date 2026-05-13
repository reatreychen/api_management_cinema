import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MoviesModule } from './movies/movies.module';
import { TheatersModule } from './theaters/theaters.module';
import { SeatsModule } from './seats/seats.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { SeatAvailabilitiesModule } from './seat_availabilities/seat_availabilities.module';
import { BookingsModule } from './bookings/bookings.module';
import { DiscountsModule } from './discounts/discounts.module';
import { BookingDetailsModule } from './booking_details/booking_details.module';
import { PaymentsModule } from './payments/payments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb+srv://cinema:xYDhAwB5tNYXkqGm@cinema.je9bqgf.mongodb.net/?appName=cinema'),
    UserModule,
    AuthModule,
    TheatersModule,
    CloudinaryModule,
    MoviesModule,
    SeatsModule,
    ShowtimesModule,
    SeatAvailabilitiesModule,
    BookingsModule,
    DiscountsModule,
    BookingDetailsModule,
    PaymentsModule,
  ],
})
export class AppModule { }
