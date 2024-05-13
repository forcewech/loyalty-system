import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { OrderDetail } from './order_details.model';
import { ProductStore } from './product_stores.model';
import { StoreRank } from './store_ranks.model';
import { EStoreStatus } from 'src/constants';

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

  @Column
  email: string;

  @Column
  password: string;

  @Column
  otpCode: string;

  @Column
  codeExpireTime: Date;

  @Column({
    defaultValue: false
  })
  isCodeUsed: boolean;

  @Column({
    defaultValue: 'store'
  })
  role: string;

  @Column({
    defaultValue: EStoreStatus.INACTIVE,
    type: DataType.ENUM(EStoreStatus.INACTIVE, EStoreStatus.ACTIVE)
  })
  status: string;

  @HasMany(() => StoreRank)
  storeRanks: StoreRank[];

  @HasMany(() => ProductStore)
  productStores: ProductStore[];

  @HasMany(() => OrderDetail)
  orderDetails: OrderDetail[];
}
