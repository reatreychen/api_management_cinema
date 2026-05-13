import { IsString, IsEmail, IsNotEmpty, IsEnum ,IsOptional} from 'class-validator';
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsString()
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    password: string;
    @IsString()
    @IsNotEmpty()
    @IsEnum(['ADMIN', 'USER'])
    role: 'ADMIN' | 'USER' = 'USER';
}
