import { Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { StoreRank } from './store_ranks.model';
import { User } from './users.model';

@Table({
  tableName: 'ranks',
  underscored: true
})
export class Rank extends Model {
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string;

  @HasMany(() => User)
  users: User[];

  @HasMany(() => StoreRank)
  storeRanks: StoreRank[];
}
