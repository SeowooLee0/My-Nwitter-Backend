import { Sequelize } from "sequelize-typescript";
import { Bookmark } from "./bookmark";
import { Comments } from "./comments";
import { Follow } from "./follow";
import { Likes } from "./like";
import { Message } from "./message";
import { SocketId } from "./socketId";
import { Tweets } from "./tweets";
import { Users } from "./user";
import mysql2 from "mysql2";
const config = require("../config/config");

const development = new Sequelize({
  dialect: "mysql",
  dialectModule: mysql2,
  host: config.development.host,
  username: config.development.username,
  password: config.development.password,
  database: config.development.database,
  timezone: config.development.timezone,

  logging: false,
  models: [Tweets, Users, Comments, Likes, SocketId, Follow, Bookmark],
});

// const test = new Sequelize({
//   dialect: "mysql",
//   dialectModule: require("mysql2"),
//   host: config.test.host,
//   username: config.test.username,
//   password: config.test.password,
//   database: "test",

//   timezone: config.test.timezone,
//   logging: false,
// });

// landings : landingImages -> 1:N
// db.landings.hasMany(db.landingImages, { as: "landingImages" });
// db.landingImages.belongsTo(db.landings, {
//   foreignKey: "landingUuid",
//   as: "landings",
// });

development.addModels([Users, Tweets, Comments, Likes, Bookmark]);

export default { development };
