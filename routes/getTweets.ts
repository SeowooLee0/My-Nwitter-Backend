import express, { Request, Response, NextFunction, Router } from "express";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
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

router.get(
  "/select",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const selectTweets: Users[] = await Users.findAll({
      include: [Tweets],
    });
    res.status(200).json({ data: selectTweets });
  }
);

module.exports = router;
