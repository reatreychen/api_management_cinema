import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SeatType } from './create-seat.dto';

export class BulkCreateSeatDto {
  @IsMongoId({ message: 'Invalid theater ID' })
  @IsNotEmpty({ message: 'Theater ID is required' })
  theater_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Rows are required' })
  rows: string[]; 
  @IsNumber({}, { message: 'Seats per row must be a number' })
  @Min(1, { message: 'At least 1 seat per row' })
  @Max(100, { message: 'Maximum 100 seats per row' })
  @Type(() => Number)
  seats_per_row: number;

  @IsEnum(SeatType, { message: 'Invalid seat type' })
  @IsNotEmpty({ message: 'Seat type is required' })
  seat_type: string;
}