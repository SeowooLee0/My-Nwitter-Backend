import express, { Request, Response, NextFunction } from "express";
import { AutoIncrement } from "sequelize-typescript";
import { and } from "sequelize/types";
import { Bookmark } from "../models/bookmark";
import { Comments } from "../models/comments";
import sequelize from "../models/index";
import { Likes } from "../models/like";
import { Users } from "../models/user";
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");
const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    await Bookmark.create({
      tweet_id: req.body.tweet_id,
      user_id: req.body.id,
    }).then((result) => {
      res.status(201).json(result);
    });
  }
);

router.post(
  "/delete",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    await Bookmark.destroy({
      where: {
        tweet_id: req.body.tweet_id,
        user_id: req.body.id,
      },
    }).then((result) => {
      res.status(201).json(result);
    });
  }
);

module.exports = router;
