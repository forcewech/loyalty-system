import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsPhoneNumber()
  @IsString()
  @IsNotEmpty()
  phone: string;
}
