import { AutoIncrement, BelongsTo, Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Rank } from './ranks.model';
import { User } from './users.model';
import { OrderRedeemDetail } from './order_redeem_details';

@Table({
  tableName: 'order_redeems',
  underscored: true
})
export class OrderRedeem extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Rank)
  @Column
  rankId: number;

  @BelongsTo(() => Rank)
  rank: Rank;

  @HasMany(() => OrderRedeemDetail)
  orderRedeemDetails: OrderRedeemDetail[];

  @Column
  redeemDate: Date;
}
