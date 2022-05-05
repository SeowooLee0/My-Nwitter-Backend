import { Sequelize } from "sequelize-typescript";
import { config } from "../config/config";
import { Tweets } from "./tweets";
import { Users } from "./user";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: config.development.host,
  username: config.development.username,
  password: config.development.password,
  database: config.development.database,
  logging: false,
  models: [Tweets, Users],
});

export default sequelize;
