import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  tableName: 'admin',
  underscored: true
})
export class Admin extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  email: string;

  @Column
  password: string;

  @Column
  fullName: string;

  @Column({
    defaultValue: 'admin'
  })
  role: string;
}
