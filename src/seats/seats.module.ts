import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SeatSchema } from './entities/seat.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Seat', schema: SeatSchema }])],
  controllers: [SeatsController],
  providers: [SeatsService],
  exports: [SeatsService],
})
export class SeatsModule { }
