import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsEnum, 
  IsBoolean, 
  IsOptional,
  IsMongoId,
  Min,
  Max,
  Length,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SeatType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  VIP = 'vip',
  RECLINER = 'recliner',
}

export class CreateSeatDto {
  @IsMongoId({ message: 'Invalid theater ID' })
  @IsNotEmpty({ message: 'Theater ID is required' })
  theater_id: string;

  @IsString()
  @IsNotEmpty({ message: 'Row letter is required' })
  @Length(1, 2, { message: 'Row letter must be 1-2 characters' })
  @Matches(/^[A-Z]+$/, { message: 'Row letter must be uppercase letters only' })
  row_letter: string;

  @IsNumber({}, { message: 'Seat number must be a number' })
  @Min(1, { message: 'Seat number must be at least 1' })
  @Max(100, { message: 'Seat number cannot exceed 100' })
  @Type(() => Number)
  seat_number: number;

  @IsEnum(SeatType, { message: 'Invalid seat type' })
  @IsNotEmpty({ message: 'Seat type is required' })
  seat_type: string;

  @IsBoolean({ message: 'is_active must be a boolean' })
  @IsOptional()
  @Type(() => Boolean)
  is_active?: boolean;
}