import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  tableName: 'gifts',
  underscored: true,
  paranoid: true
})
export class Gift extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  redemptionPoints: string;

  @Column
  expirationDate: Date;

  @Column
  quantity: number;

  @Column
  description: string;

  @Column
  image: string;
}
