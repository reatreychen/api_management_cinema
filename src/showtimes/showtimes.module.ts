import { forwardRef, Module } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { ShowtimesController } from './showtimes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Showtime, ShowtimeSchema } from './entities/showtime.entity';
import { SeatAvailabilitiesModule } from '../seat_availabilities/seat_availabilities.module';
import { SeatsModule } from '../seats/seats.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Showtime.name, schema: ShowtimeSchema },
    ]),
    forwardRef(() => SeatAvailabilitiesModule),
    SeatsModule,
  ],
  controllers: [ShowtimesController],
  providers: [ShowtimesService],
  exports: [ShowtimesService],
})
export class ShowtimesModule { }
