import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class PasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
