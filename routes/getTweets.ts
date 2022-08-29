import express, { Request, Response, NextFunction, Router } from "express";
import { Comments } from "../models/comments";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const router = express.Router();

router.get(
  "/",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const allTweets: Tweets[] = await Tweets.findAll({
      include: [Comments],
    });
    res.status(200).json({ data: allTweets, email: req.email });
  }
);

router.get(
  "/select",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const selectTweets: Users[] = await Users.findAll({
      include: [Tweets],
    });
    const selectComments: Tweets[] = await Tweets.findAll({
      include: [Comments],
    });
    res.status(200).json({ data: selectTweets, selectComments });
  }
);

module.exports = router;
