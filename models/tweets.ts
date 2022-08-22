import {
  Table,
  Column,
  Model,
  DataType,
  Sequelize,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { Association, IntegerDataType } from "sequelize/types";
import { Users } from "./user";
const sequelize = require("../models/index");

interface Tag {
  tag: string;
}

@Table({
  timestamps: false,
  tableName: "tweets",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class Tweets extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  tweet_id!: IntegerDataType;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  tag!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  write_date!: string;

  @BelongsTo(() => Users)
  user!: Users;
}
