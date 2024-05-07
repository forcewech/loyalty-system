import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { ProductStore } from './product_stores.model';
import { UserReward } from './user_rewards.model';

@Table({
  tableName: 'gifts',
  underscored: true
})
export class Gift extends Model {
  @Column
  productId: string;

  @Column
  name: string;

  @Column
  redemptionPoints: string;

  @Column
  image: string;

  @Column
  expirationDate: Date;

  @Column
  quantity: number;

  @Column
  description: string;

  @HasMany(() => UserReward)
  userRewards: UserReward[];

  @HasMany(() => ProductStore)
  productStores: ProductStore[];
}
