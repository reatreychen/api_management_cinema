import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
    @IsNotEmpty()
    @IsMongoId()
    booking_id: string;

    @IsNotEmpty()
    @IsString()
    payment_method: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
