import { IsDate, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateGiftDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  redemptionPoints: number;

  @IsDate()
  expirationDate: Date;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsString()
  description: string;
}
