import express, { Request, Response, NextFunction, Router } from "express";
import { Tweets } from "../models/tweets";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const allTweets: Tweets[] = await Tweets.findAll();
  return res.status(200).json(allTweets);
});

module.exports = router;
