import express, { Request, Response, NextFunction, Router } from "express";
import { read } from "fs";
import { where } from "sequelize/types";
import { Comments } from "../models/comments";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const router = express.Router();

router.post(
  "/",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const openComments: Comments[] = await Comments.findAll({
      where: { tweet_id: req.body.tweet_id },
    });
    res.status(200).json({ data: openComments, is_opened: true });
  }
);

module.exports = router;
