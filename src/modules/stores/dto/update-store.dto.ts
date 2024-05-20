import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDto } from './create-store.dto';
import { IsString } from 'class-validator';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @IsString()
  typePoint?: string;
}
