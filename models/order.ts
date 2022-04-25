import { Table, Model, Column, DataType } from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: "orders",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class Order extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  number!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  product!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  price!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  payment!: string;
}
