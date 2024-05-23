import { AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ProductStore } from './product_stores.model';
import { UserReward } from './user_rewards.model';

@Table({
  tableName: 'gifts',
  underscored: true,
  paranoid: true
})
export class Gift extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  redemptionPoints: string;

  @Column
  expirationDate: Date;

  @Column
  quantity: number;

  @Column
  description: string;

  @Column
  image: string;

  @HasMany(() => UserReward)
  userRewards: UserReward[];

  @HasMany(() => ProductStore)
  productStores: ProductStore[];
}
