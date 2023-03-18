import {
  Table,
  Column,
  Model,
  DataType,
  Sequelize,
  BelongsTo,
  ForeignKey,
  HasMany,
} from "sequelize-typescript";
import { Association, IntegerDataType } from "sequelize/types";
import { Json } from "sequelize/types/utils";
import { Bookmark } from "./bookmark";
import { Comments } from "./comments";
import { Likes } from "./like";
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
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id!: IntegerDataType;

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

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  reply_tweet_id!: IntegerDataType;

  @BelongsTo(() => Users)
  user!: Users;

  @HasMany(() => Comments)
  comment!: Comments[];

  @HasMany(() => Likes)
  like!: Likes[];
  @HasMany(() => Bookmark)
  bookmark!: Bookmark[];
  // @HasMany(() => Retweet)
  // retweet!: Retweet[];
}
