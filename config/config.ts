const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    timezone: "+09:00", // 한국 timezone 설정
    dialectOptions: {
      dateStrings: true, // 가져올 때 string으로 가져오기
      typeCast: true,
    },
  },
  // test: {
  //   username: process.env.DB_USERNAME,
  //   password: process.env.DB_PASSWORD,
  //   database: "test",
  //   host: process.env.DB_HOST,
  //   port: process.env.DB_PORT,
  //   dialect: "mysql",
  //   timezone: "Etc/GMT-9",
  // },
};
