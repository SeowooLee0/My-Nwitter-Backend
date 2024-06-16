import express, { Request, Response, NextFunction } from "express";
import { AutoIncrement } from "sequelize-typescript";
import { Comments } from "../models/comments";
import sequelize from "../models/index";
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");
const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    await Comments.create({
      tweet_id: req.body.tweet_id,
      email: req.email,
      comment: req.body.comment,
      write_date: sequelize.development.literal(`now()`),
    }).then((result) => {
      res.status(201).json(result);
    });
  }
);

module.exports = router;
