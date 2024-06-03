import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Rank } from './ranks.model';
import { Store } from './stores.model';
import { User } from './users.model';

@Table({
  tableName: 'store_users',
  underscored: true
})
export class StoreUser extends Model {
  @ForeignKey(() => Store)
  @Column
  storeId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;
}
