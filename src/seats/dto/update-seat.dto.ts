import { PartialType } from '@nestjs/mapped-types';
import { CreateSeatDto } from './create-seat.dto';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SeatType } from './create-seat.dto';

export class UpdateSeatDto extends PartialType(CreateSeatDto) {
  @IsString()
  @IsOptional()
  @Length(1, 2, { message: 'Row letter must be 1-2 characters' })
  @Matches(/^[A-Z]+$/, { message: 'Row letter must be uppercase letters only' })
  row_letter?: string;

  @IsNumber({}, { message: 'Seat number must be a number' })
  @IsOptional()
  @Min(1, { message: 'Seat number must be at least 1' })
  @Max(100, { message: 'Seat number cannot exceed 100' })
  @Type(() => Number)
  seat_number?: number;

  @IsEnum(SeatType, { message: 'Invalid seat type' })
  @IsOptional()
  seat_type?: string;

  @IsBoolean({ message: 'is_active must be a boolean' })
  @IsOptional()
  @Type(() => Boolean)
  is_active?: boolean;
}