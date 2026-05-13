import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
export class CreateTheaterDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    imagePublicId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    capacity?: number;

    @IsOptional()
    @IsString()
    type?: string; // IMAX, 3D, Standard

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;
}
