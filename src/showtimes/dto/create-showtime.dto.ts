import { IsMongoId, IsNotEmpty, IsNumber, IsString, IsOptional, Min, Matches, IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export class CreateShowtimeDto {
  @IsNotEmpty()
  @IsMongoId()
  movie_id: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  theater_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  show_date: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Time must be in HH:MM format' })
  show_time: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Time must be in HH:MM format' })
  end_time: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price_standard: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price_premium: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ticket_count_available?: number;

  @IsOptional()
  @IsEnum(['scheduled', 'ongoing', 'completed', 'cancelled'])
  status?: string;
}