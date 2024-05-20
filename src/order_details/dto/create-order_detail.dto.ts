import { IsNumber } from 'class-validator';

export class CreateOrderDetailDto {
  @IsNumber()
  storeId: number;
  @IsNumber()
  totalMoney: number;
}
