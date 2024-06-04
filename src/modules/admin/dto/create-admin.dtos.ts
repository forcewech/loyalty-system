import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @MaxLength(255)
  fullName: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
