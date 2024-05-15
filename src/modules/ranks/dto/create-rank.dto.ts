import { IsNumber, IsString } from 'class-validator';

export class CreateRankDto {
  @IsString()
  name: string;
}
