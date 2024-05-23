import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateGiftDto {
  @IsString()
  name: string;

  @IsNumber()
  redemptionPoints: number;

  @IsDate()
  expirationDate: Date;

  @IsNumber()
  quantity: number;

  @IsString()
  description: string;
}
