import { Column, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './users.model';
import { Store } from './stores.model';
import { Rank } from './ranks.model';

@Table({
  tableName: 'order_details',
  underscored: true
})
export class OrderDetail extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Store)
  @Column
  storeId: number;

  @ForeignKey(() => Rank)
  @Column
  rankId: number;

  @Column
  totalMoney: number;

  @Column
  totalPoint: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Store)
  store: Store;
}
