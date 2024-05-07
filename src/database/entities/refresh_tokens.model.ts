import { BelongsTo, Column, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { StoreRank } from './store_ranks.model';
import { User } from './users.model';

@Table({
  tableName: 'refresh_tokens',
  underscored: true
})
export class RefreshToken extends Model {
  @Column
  tokenId: string;

  @Column
  token: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  expiryDate: Date;
}
