import { PartialType } from '@nestjs/mapped-types';
import { CreateSeatAvailabilityDto } from './create-seat_availability.dto';

export class UpdateSeatAvailabilityDto extends PartialType(CreateSeatAvailabilityDto) {}
