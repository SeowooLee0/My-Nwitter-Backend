import express, { Request, Response, NextFunction } from "express";
import sequelize from "../models";
import { Tweets } from "../models/tweets";
// import bodyParser from "body-parser";
import cors from "cors";
// import "reflect-metadata";

const app = express();

app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.get("/", (req: Request, res: Response, next: NextFunction) => {
//   res.send("welcome!");
// });
// app.get("/tweets", async (req: Request, res: Response): Promise<Response> => {
//   const allTweets: Tweets[] = await Tweets.findAll();
//   return res.status(200).json(allTweets);
// });

// app.post("/tweets", async (req: Request, res: Response): Promise<Response> => {
//   const tweets: Tweets = await Tweets.create({ ...req.body });
//   return res.status(201).json(tweets);
// });

app.listen("1234", async () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: 1234🛡️
  ################################################
`);
  await sequelize
    .sync()
    .then(async () => {
      console.log("connection success");
    })
    .catch((e) => {
      console.log("TT : ", e);
    });
});
