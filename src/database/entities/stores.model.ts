import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript';
import { EStoreStatus } from 'src/constants';
import { Gift } from './gifts.model';
import { OrderDetail } from './order_details.model';
import { ProductStore } from './product_stores.model';
import { StoreUser } from './store_users.model';
import { User } from './users.model';

@Table({
  tableName: 'stores',
  underscored: true,
  paranoid: true
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
    defaultValue: ''
  })
  forgotPasswordToken: string;

  @Column({
    defaultValue: 'fixed'
  })
  typePoint: string;

  @Column({
    defaultValue: EStoreStatus.INACTIVE,
    type: DataType.ENUM(EStoreStatus.INACTIVE, EStoreStatus.ACTIVE)
  })
  status: string;

  @BelongsToMany(() => User, () => StoreUser)
  users!: User[];

  @BelongsToMany(() => Gift, () => ProductStore)
  gifts!: Gift[];

  @HasMany(() => OrderDetail)
  orderDetails: OrderDetail[];
}
