import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Gift } from './gifts.model';
import { Rank } from './ranks.model';
import { User } from './users.model';

@Table({
  tableName: 'user_rewards',
  underscored: true
})
export class UserReward extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Rank)
  @Column
  rankId: number;

  @ForeignKey(() => Gift)
  @Column
  productId: number;

  @Column
  quantity: number;

  @Column
  redeemDate: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Gift)
  gift: Gift;
}
