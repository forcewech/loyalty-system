import { AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './users.model';

@Table({
  tableName: 'ranks',
  underscored: true,
  paranoid: true
})
export class Rank extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @HasMany(() => User)
  users: User[];
}
