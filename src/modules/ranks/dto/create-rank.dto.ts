import { IsEnum, IsString } from 'class-validator';
import { ETypeRank } from 'src/constants';

export class CreateRankDto {
  @IsString()
  @IsEnum(ETypeRank)
  name: string;
}
