import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from "sequelize-typescript";
import { IntegerDataType, Optional } from "sequelize/types";
import { Json } from "sequelize/types/utils";
import { Bookmark } from "./bookmark";
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

  @ForeignKey(() => Bookmark)
  @ForeignKey(() => Tweets)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    // primaryKey: true,
  })
  tweet_id!: IntegerDataType;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  user_id!: IntegerDataType;

  @BelongsTo(() => Tweets)
  tweets!: Tweets;

  @BelongsTo(() => Bookmark)
  bookmark!: Bookmark[];
}
