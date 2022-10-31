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

@Table({
  timestamps: false,
  tableName: "socketId",
  charset: "utf8",
  collate: "utf8_general_ci",
})
export class SocketId extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id!: IntegerDataType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  socket_id!: string;
}
