import express, { Request, Response, NextFunction } from "express";
import sequelize from "../models";
import { Tweets } from "../models/tweets";
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  async (req: any, res: Response, next: NextFunction) => {
    await Tweets.create({
      email: req.email,
      content: req.body.content,
      write_date: sequelize.literal(`now()`),
    }).then((result) => {
      res.status(201).json(result);
    });
  }
);

module.exports = router;
