import express, { Request, Response, NextFunction } from "express";
import sequelize from "../models";
import { Tweets } from "../models/tweets";
import bodyParser from "body-parser";
import cookiePaser from "cookie-parser";
import cors from "cors";

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
app.use("/getTweets", getTweets);

const saveTweets = require("../routes/saveTweets");
app.use("/saveTweets", saveTweets);

const register = require("../routes/register");
app.use("/register", register);

const login = require("../routes/login");
app.use("/login", login);

const refreshTokenRequest = require("../routes/refreshTokenRequest");
app.use("/refreshTokenRequest", refreshTokenRequest);

// const accessChecker = require("../routes/accessChecker");
// app.use("/accessChecker", accessChecker);

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
