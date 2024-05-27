import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Gift } from './gifts.model';
import { OrderRedeem } from './order_redeems.model';
import { Rank } from './ranks.model';
import { User } from './users.model';
import { EGiftStatus } from 'src/constants';

@Table({
  tableName: 'order_redeem_details',
  underscored: true
})
export class OrderRedeemDetail extends Model {
  @ForeignKey(() => OrderRedeem)
  @Column
  orderRedeemId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Rank)
  @Column
  rankId: number;

  @ForeignKey(() => Gift)
  @Column
  productId: number;

  @Column({
    defaultValue: EGiftStatus.NOT_REDEEMED,
    type: DataType.ENUM(EGiftStatus.NOT_REDEEMED, EGiftStatus.REDEEMED)
  })
  status: string;

  @Column
  quantity: number;

  @Column
  totalPrices: number;

  @BelongsTo(() => OrderRedeem)
  orderRedeem: OrderRedeem;

  @BelongsTo(() => Gift)
  gift: Gift;
}
