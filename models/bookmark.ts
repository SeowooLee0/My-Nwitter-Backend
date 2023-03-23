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
import { Comments } from "./comments";
import { Likes } from "./like";
import { Tweets } from "./tweets";

@Table({
  timestamps: false,
  tableName: "bookmark",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class Bookmark extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: IntegerDataType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  content!: string;

  @ForeignKey(() => Tweets)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  tweet_id!: IntegerDataType;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  user_id!: IntegerDataType;

  @BelongsTo(() => Tweets)
  tweets!: Tweets;

  @HasMany(() => Comments)
  comment!: Comments[];

  @HasMany(() => Likes)
  like!: Likes[];
}
