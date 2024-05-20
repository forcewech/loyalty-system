import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { OrderDetail } from './order_details.model';
import { ProductStore } from './product_stores.model';
import { StoreRank } from './store_ranks.model';
import { EStoreStatus } from 'src/constants';
import { StoreUser } from './store_users.model';

@Table({
  tableName: 'stores',
  underscored: true
})
export class Store extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Unique
  @Column
  name: string;

  @Column
  address: string;

  @Unique
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
    defaultValue: 'fixed'
  })
  typePoint: string;

  @Column({
    defaultValue: EStoreStatus.INACTIVE,
    type: DataType.ENUM(EStoreStatus.INACTIVE, EStoreStatus.ACTIVE)
  })
  status: string;

  @HasMany(() => StoreRank)
  storeRanks: StoreRank[];

  @HasMany(() => StoreUser)
  storeUsers: StoreUser[];

  @HasMany(() => ProductStore)
  productStores: ProductStore[];

  @HasMany(() => OrderDetail)
  orderDetails: OrderDetail[];
}
