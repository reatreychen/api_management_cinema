import { IsOptional, IsMongoId, IsString, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SeatType } from './create-seat.dto';

export class QuerySeatDto {
    @IsOptional()
    @IsMongoId()
    theater_id?: string;

    @IsOptional()
    @IsString()
    row_letter?: string;

    @IsOptional()
    @IsEnum(SeatType)
    seat_type?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 50;
}