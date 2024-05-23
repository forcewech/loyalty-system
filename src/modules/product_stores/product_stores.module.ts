import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductStore } from 'src/database';
import { ProductStoresRepository } from './product_stores.repository';

@Module({
  imports: [SequelizeModule.forFeature([ProductStore])],
  providers: [ProductStoresRepository],
  exports: [ProductStoresRepository]
})
export class ProductStoresModule {}
