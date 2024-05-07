import { Column, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'admin',
  underscored: true
})
export class Admin extends Model {
  @Column
  adminId: string;

  @Column
  email: string;

  @Column
  password: string;

  @Column
  fullName: string;
}
