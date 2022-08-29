import { Sequelize } from "sequelize-typescript";
import { config } from "../config/config";
import { Comments } from "./comments";
import { Tweets } from "./tweets";
import { Users } from "./user";

const development = new Sequelize({
  dialect: "mysql",
  host: config.development.host,
  username: config.development.username,
  password: config.development.password,
  database: config.development.database,
  logging: false,
  models: [Tweets, Users, Comments],
});

const test = new Sequelize({
  dialect: "mysql",
  host: config.test.host,
  username: config.test.username,
  password: config.test.password,
  database: "test",
  logging: false,
});

// landings : landingImages -> 1:N
// db.landings.hasMany(db.landingImages, { as: "landingImages" });
// db.landingImages.belongsTo(db.landings, {
//   foreignKey: "landingUuid",
//   as: "landings",
// });

development.addModels([Users, Tweets, Comments]);

export default { development, test };
