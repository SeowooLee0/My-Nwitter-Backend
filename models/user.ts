import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { IntegerDataType, Optional } from "sequelize/types";
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
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
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
}

// Users.hasMany(Tweets, {
//   as: "tweets",
//   foreignKey: "email",
// });

// Tweets.belongsTo(Users);
