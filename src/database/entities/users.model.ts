import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript';
import { EGender, EUserStatus } from 'src/constants';
import { OrderDetail } from './order_details.model';
import { Rank } from './ranks.model';
import { RefreshToken } from './refresh_tokens.model';

@Table({
  tableName: 'users',
  underscored: true,
  paranoid: true
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  fullName: string;

  @Unique
  @Column
  email: string;

  @Column
  password: string;

  @Column({ type: DataType.ENUM(EGender.MALE, EGender.FEMALE) })
  gender: string;

  @Unique
  @Column
  phone: string;

  @Column({
    defaultValue: 'client'
  })
  role: string;

  @Column({ type: DataType.FLOAT, defaultValue: 0 })
  rewardPoints: number;

  @Column({ type: DataType.FLOAT, defaultValue: 0 })
  reservePoints: number;
  @Column
  otpCode: string;

  @Column
  codeExpireTime: Date;

  @Column({
    defaultValue: EUserStatus.INACTIVE,
    type: DataType.ENUM(EUserStatus.INACTIVE, EUserStatus.ACTIVE)
  })
  status: string;

  @ForeignKey(() => Rank)
  @Column
  rankId: number;

  @BelongsTo(() => Rank)
  rank: Rank;

  @HasMany(() => OrderDetail)
  orderDetails: OrderDetail[];

  @HasMany(() => RefreshToken)
  refreshTokens: RefreshToken[];
}
