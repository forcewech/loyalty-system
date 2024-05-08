import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { EGender } from 'src/constants';
import { OrderDetail } from './order_details.model';
import { Rank } from './ranks.model';
import { UserReward } from './user_rewards.model';
import { RefreshToken } from './refresh_tokens.model';

@Table({
  tableName: 'users',
  underscored: true
})
export class User extends Model {
  @PrimaryKey
  @Column
  id: number;

  @Column
  fullName: string;

  @Column
  email: string;

  @Column
  password: string;

  @Column({ type: DataType.ENUM(EGender.MALE, EGender.FEMALE) })
  gender: string;

  @Column
  phone: string;

  @Column
  rewardPoints: number;

  @Column
  reservePoints: number;

  @ForeignKey(() => Rank)
  @Column
  rankId: number;

  @BelongsTo(() => Rank)
  rank: Rank;

  @HasMany(() => OrderDetail)
  orderDetails: OrderDetail[];

  @HasMany(() => RefreshToken)
  refreshTokens: RefreshToken[];

  @HasMany(() => UserReward)
  userRewards: UserReward[];
}
