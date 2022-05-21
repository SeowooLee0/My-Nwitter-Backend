import express, { Request, Response, NextFunction, Router } from "express";
import { Tweets } from "../models/tweets";
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const router = express.Router();

router.get(
  "/",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const allTweets: Tweets[] = await Tweets.findAll();
    res.status(200).json({ data: allTweets, email: req.email });
  }
);
module.exports = router;
