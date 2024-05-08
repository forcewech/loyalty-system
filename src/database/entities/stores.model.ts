import { AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { OrderDetail } from './order_details.model';
import { ProductStore } from './product_stores.model';
import { StoreRank } from './store_ranks.model';

@Table({
  tableName: 'stores',
  underscored: true
})
export class Store extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  address: string;

  @HasMany(() => StoreRank)
  storeRanks: StoreRank[];

  @HasMany(() => ProductStore)
  productStores: ProductStore[];

  @HasMany(() => OrderDetail)
  orderDetails: OrderDetail[];
}
