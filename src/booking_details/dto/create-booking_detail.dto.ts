import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBookingDetailDto {
    @IsNotEmpty()
    @IsMongoId()
    booking_id: string;

    @IsNotEmpty()
    @IsMongoId()
    seat_id: string;

    @IsNotEmpty()
    @IsNumber()
    ticket_price: number;

    @IsNotEmpty()
    @IsString()
    seat_type: string;

    @IsNotEmpty()
    @IsString()
    ticket_number: string;
}
