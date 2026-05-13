import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDetailDto } from './create-booking_detail.dto';

export class UpdateBookingDetailDto extends PartialType(CreateBookingDetailDto) {}
