import { IsString } from 'class-validator';

export class OtpDto {
  @IsString()
  otpCode: string;
}
