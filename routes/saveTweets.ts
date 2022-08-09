import express, { Request, Response, NextFunction } from "express";
import sequelize from "../models/index";
import { Tweets } from "../models/tweets";
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");
const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    if (req.token === "login again") {
      res.json("login again");
    } else if (req.token === "refresh ok") {
      await Tweets.create({
        email: req.email,
        content: req.body.content,
        tag: req.body.tag,
        write_date: sequelize.development.literal(`now()`),
      }).then((result) => {
        res.status(201).json(result);
      });
    }
  }
);

module.exports = router;
