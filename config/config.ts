import dotenv from "dotenv";
dotenv.config();

export const config = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
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
