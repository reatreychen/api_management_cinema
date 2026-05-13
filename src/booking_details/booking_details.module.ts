import { Module } from '@nestjs/common';
import { BookingDetailsService } from './booking_details.service';
import { BookingDetailsController } from './booking_details.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { BookingDetail, BookingDetailSchema } from './entities/booking_detail.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BookingDetail.name, schema: BookingDetailSchema }]),
  ],
  controllers: [BookingDetailsController],
  providers: [BookingDetailsService],
  exports: [BookingDetailsService],
})
export class BookingDetailsModule { }
