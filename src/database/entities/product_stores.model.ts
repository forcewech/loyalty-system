import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Gift } from './gifts.model';
import { Store } from './stores.model';

@Table({
  tableName: 'product_stores',
  underscored: true
})
export class ProductStore extends Model {
  @ForeignKey(() => Store)
  @Column
  storeId: number;

  @ForeignKey(() => Gift)
  @Column
  productId: number;

  @BelongsTo(() => Store)
  store: Store;

  @BelongsTo(() => Gift)
  gift: Gift;
}
