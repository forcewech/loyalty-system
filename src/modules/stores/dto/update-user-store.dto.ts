import { PartialType } from '@nestjs/mapped-types';
import { CreateUserStoreDto } from './create-user-store.dto';

export class UpdateUserStoreDto extends PartialType(CreateUserStoreDto) {}
