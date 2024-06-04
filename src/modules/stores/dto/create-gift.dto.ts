import { IsDate, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateGiftDto {
  @IsString()
  @MaxLength(255)
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
