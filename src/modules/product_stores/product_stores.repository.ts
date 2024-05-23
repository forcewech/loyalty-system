import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from 'src/database';
import { ProductStore } from 'src/database/entities';

@Injectable()
export class ProductStoresRepository extends BaseRepository<ProductStore> {
  constructor(@InjectModel(ProductStore) readonly model: typeof ProductStore) {
    super(model);
  }
}
