import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeatAvailabilitiesController } from './seat_availabilities.controller';
import { SeatAvailabilitiesService } from './seat_availabilities.service';
import { SeatAvailability, SeatAvailabilitySchema } from './entities/seat_availability.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeatAvailability.name, schema: SeatAvailabilitySchema },
    ]),
  ],
  controllers: [SeatAvailabilitiesController],
  providers: [SeatAvailabilitiesService],
  exports: [SeatAvailabilitiesService],
})
export class SeatAvailabilitiesModule {}