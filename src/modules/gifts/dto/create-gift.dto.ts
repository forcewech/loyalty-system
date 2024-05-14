import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateGiftDto {
  @IsString()
  name: string;

  @IsString()
  redemptionPoints: string;

  @IsDate()
  expirationDate: Date;

  @IsNumber()
  quantity: number;

  @IsString()
  description: string;
}
