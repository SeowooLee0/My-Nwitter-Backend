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
import { Json } from "sequelize/types/utils";
import { Tweets } from "./tweets";
import { Users } from "./user";

@Table({
  timestamps: false,
  tableName: "follow",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class Follow extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: IntegerDataType;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    // primaryKey: true,
  })
  follower_id!: IntegerDataType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id!: IntegerDataType;

  @BelongsTo(() => Users)
  user!: Users;
}
