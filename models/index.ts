import { Sequelize } from "sequelize-typescript";
import { config } from "../config/config";
import { Tweets } from "./tweets";
import { Users } from "./user";

const development = new Sequelize({
  dialect: "mysql",
  host: config.development.host,
  username: config.development.username,
  password: config.development.password,
  database: config.development.database,
  logging: false,
  models: [Tweets, Users],
});

const test = new Sequelize({
  dialect: "mysql",
  host: config.test.host,
  username: config.test.username,
  password: config.test.password,
  database: "test",
  logging: false,
});

export default { development, test };
