import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { StoreRank } from './store_ranks.model';
import { User } from './users.model';

@Table({
  tableName: 'ranks',
  underscored: true
})
export class Rank extends Model {
  @Column
  rankId: string;

  @Column
  name: string;

  @HasMany(() => User)
  users: User[];

  @HasMany(() => StoreRank)
  storeRanks: StoreRank[];
}
