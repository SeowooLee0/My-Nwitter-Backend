import express, { Request, Response, NextFunction } from "express";
import sequelize from "../models";
import { Tweets } from "../models/tweets";
import bodyParser from "body-parser";
import cookiePaser from "cookie-parser";
import cors from "cors";
import { accessCheker } from "../middleware/accessChecker";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookiePaser());

app.get("/", (req: Request, res: Response, next: NextFunction) => {});

const getTweets = require("../routes/getTweets");
app.use("/getTweets", getTweets, accessCheker);

const saveTweets = require("../routes/saveTweets");
app.use("/saveTweets", saveTweets, accessCheker);

const register = require("../routes/register");
app.use("/register", register);

const login = require("../routes/login");
app.use("/login", login);

const refreshTokenRequest = require("../routes/refreshTokenRequest");
app.use("/refreshTokenRequest", refreshTokenRequest);

app.listen("1234", async () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: 1234🛡️
  ################################################
`);
  await sequelize
    .sync()
    .then(() => {
      console.log("connection success");
    })
    .catch((e) => {
      console.log("error: ", e);
    });
});
