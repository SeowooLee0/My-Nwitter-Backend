import express, { Request, Response, NextFunction } from "express";
import sequelize from "../models";
import { Tweets } from "../models/tweets";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("welcome!");
});

const getTweets = require("../routes/getTweets");
app.use("/getTweets", getTweets);

const saveTweets = require("../routes/saveTweets");
app.use("/saveTweets", saveTweets);

const register = require("../routes/register");
app.use("/register", register);

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
