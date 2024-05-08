import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { Store } from 'src/database/entities';

@Injectable()
export class StoresRepository extends BaseRepository<Store> {
  constructor(@InjectModel(Store) readonly model: typeof Store) {
    super(model);
  }
}
