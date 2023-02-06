import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { IntegerDataType, Optional } from "sequelize/types";
import { Tweets } from "./tweets";
import { Users } from "./user";

@Table({
  timestamps: false,
  tableName: "message",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class Message extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: IntegerDataType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  receiver!: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    // primaryKey: true,
  })
  user_id!: IntegerDataType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  write_date!: string;

  @BelongsTo(() => Users)
  user!: Users;
}
