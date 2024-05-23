import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './users.model';
import { Admin } from './admin.model';
import { Store } from './stores.model';

@Table({
  tableName: 'refresh_tokens',
  underscored: true
})
export class RefreshToken extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  token: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Admin)
  @Column
  adminId: number;

  @BelongsTo(() => Admin)
  admin: Admin;

  @ForeignKey(() => Store)
  @Column
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  @Column
  expiryDate: Date;
}
