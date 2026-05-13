import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateBookingDto {
    @IsNotEmpty()
    @IsMongoId()
    customer_id: string;

    @IsNotEmpty()
    @IsMongoId()
    showtime_id: string;

    @IsNotEmpty()
    @IsNumber()
    total_amount: number;

    @IsOptional()
    @IsMongoId()
    discount_id?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsNotEmpty()
    @IsArray()
    @IsMongoId({ each: true })
    seat_ids: string[];
}
