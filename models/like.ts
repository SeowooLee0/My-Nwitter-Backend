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

@Table({
  timestamps: false,
  tableName: "likes",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class Likes extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: IntegerDataType;

  @ForeignKey(() => Tweets)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    // primaryKey: true,
  })
  tweet_id!: IntegerDataType;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  like_users!: Json;

  @BelongsTo(() => Tweets)
  tweets!: Tweets;
}
