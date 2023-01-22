import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { IntegerDataType, Optional } from "sequelize/types";
import { Follow } from "./follow";
import { Tweets } from "./tweets";

interface UsersAttributes {
  id: string;
  email: string;
  password: string;
  profile: string;
}

@Table({
  timestamps: false,
  tableName: "users",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class Users extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  user_id!: IntegerDataType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profile!: string;

  @HasMany(() => Tweets)
  tweets!: Tweets[];
  @HasMany(() => Follow)
  follow!: Follow[];
}

// Users.hasMany(Tweets, {
//   as: "tweets",
//   foreignKey: "email",
// });

// Tweets.belongsTo(Users);
