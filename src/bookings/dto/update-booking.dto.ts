import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';

import { IsEnum, IsOptional } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
    @IsOptional()
    @IsEnum(['pending', 'confirmed', 'cancelled', 'completed'])
    booking_status?: string;
}
