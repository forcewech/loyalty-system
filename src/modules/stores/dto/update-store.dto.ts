import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDto } from './create-store.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ETypePoint } from 'src/constants';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @IsOptional()
  @IsString()
  @IsEnum(ETypePoint)
  typePoint?: string;
}
