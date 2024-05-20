import { IsPhoneNumber, IsString } from 'class-validator';

export class PhoneDto {
  @IsPhoneNumber()
  @IsString()
  phone: string;
}
