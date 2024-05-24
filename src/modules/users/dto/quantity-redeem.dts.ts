import { IsNumber, IsPositive } from 'class-validator';

export class QuantityRedeemDto {
  @IsNumber()
  @IsPositive()
  quantity: number;
}
