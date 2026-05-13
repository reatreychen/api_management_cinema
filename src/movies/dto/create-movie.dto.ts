import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  MaxLength,
  IsEnum,
  IsArray,
  ArrayNotEmpty
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum MovieRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG-13',
  R = 'R',
  NC15 = 'NC15',
  NC17 = 'NC-17',
}

export enum MovieGenre {
  ACTION = 'Action',
  COMEDY = 'Comedy',
  DRAMA = 'Drama',
  HORROR = 'Horror',
  ROMANCE = 'Romance',
  THRILLER = 'Thriller',
  SCIFI = 'Science Fiction',
  FANTASY = 'Fantasy',
  ANIMATION = 'Animation',
  DOCUMENTARY = 'Documentary',
}

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @IsArray({ message: 'Genre must be an array' })
  @ArrayNotEmpty({ message: 'At least one genre is required' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(';').map(s => s.trim()).filter(Boolean);
    }
    return value;
  })
  genre: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  @Type(() => Number)
  duration_minutes: number;

  @IsEnum(MovieRating, { message: 'Invalid rating' })
  @IsNotEmpty({ message: 'Rating is required' })
  rating: string;

  @IsString()
  @IsNotEmpty({ message: 'Language is required' })
  language: string;

  @IsNotEmpty({ message: 'Release date is required' })
  @IsString()
  release_date: string;
}