
import { IsMongoId, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateSeatAvailabilityDto {
    @IsNotEmpty()
    @IsMongoId()
    showtime_id: string;

    @IsNotEmpty()
    @IsMongoId()
    seat_id: string;

    @IsOptional()
    @IsEnum(['available', 'reserved', 'booked'])
    status?: string = 'available';
}
