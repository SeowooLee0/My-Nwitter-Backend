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
import { Bookmark } from "./bookmark";
import { Tweets } from "./tweets";

@Table({
  timestamps: false,
  tableName: "comments",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class Comments extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: IntegerDataType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @ForeignKey(() => Tweets)
  @ForeignKey(() => Bookmark)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    // primaryKey: true,
  })
  tweet_id!: IntegerDataType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  comment!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  write_date!: string;

  @BelongsTo(() => Tweets)
  tweets!: Tweets;

  @BelongsTo(() => Bookmark)
  bookmark!: Bookmark[];
}
