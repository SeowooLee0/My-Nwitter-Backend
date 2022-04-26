import express, { Request, Response, NextFunction, Router } from "express";
import { Tweets } from "../models/tweets";
import bodyParser from "body-parser";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  await Tweets.create().then((tweets) => {
    res.status(200).json(tweets);
  });
});

module.exports = router;
