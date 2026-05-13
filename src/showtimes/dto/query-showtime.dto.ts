import { IsMongoId, IsOptional, IsString, IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export class QueryShowtimeDto {
  @IsOptional()
  @IsMongoId()
  movie_id?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  theater_id?: Types.ObjectId;

  @IsOptional()
  @IsString()
  show_date?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'ongoing', 'completed', 'cancelled'])
  status?: string;
}