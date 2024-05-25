import { IsNumber, IsPositive } from 'class-validator';

export class RedeemToCartDto {
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  storeId: number;
}
