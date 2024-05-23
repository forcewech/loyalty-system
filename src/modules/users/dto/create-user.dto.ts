import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { EGender } from 'src/constants';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1
  })
  password: string;

  @IsString()
  @IsEnum(EGender)
  gender: string;

  @IsPhoneNumber()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  storeId: string;
}
