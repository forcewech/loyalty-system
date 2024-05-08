import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './users.model';

@Table({
  tableName: 'refresh_tokens',
  underscored: true
})
export class RefreshToken extends Model {
  @PrimaryKey
  @Column
  id: number;

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
