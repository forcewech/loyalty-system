import { Column, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Store } from './stores.model';
import { Rank } from './ranks.model';

@Table({
  tableName: 'store_ranks',
  underscored: true
})
export class StoreRank extends Model {
  @ForeignKey(() => Store)
  @Column
  storeId: number;

  @ForeignKey(() => Rank)
  @Column
  rankId: number;

  @BelongsTo(() => Store)
  store: Store;

  @BelongsTo(() => Rank)
  rank: Rank;
}
