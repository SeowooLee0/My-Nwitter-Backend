import express, { Request, Response, NextFunction, Router } from "express";
import { read } from "fs";

import sequelize from "../models/index";
import { Comments } from "../models/comments";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
import { timeStamp } from "console";
import { Op } from "sequelize";

const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const router = express.Router();

router.post(
  "/",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const openComments: Comments[] = await Comments.findAll({
      where: { tweet_id: req.body.tweet_id },
    });

    const newComments: Comments[] = await Comments.findAll({
      where: {
        write_date: {
          [Op.gte]: sequelize.development.literal("now() - INTERVAL 24 HOUR"),
        },
      },
    });

    // console.log(newComments);
    res.status(200).json({ data: openComments, is_opened: true, newComments });
  }
);

router.get(
  "/newComments",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const newComments: Comments[] = await Comments.findAll({
      where: {
        write_date: {
          [Op.gte]: sequelize.development.literal("now() - INTERVAL 24 HOUR"),
        },
      },
    });

    // console.log(newComments);
    res.status(200).json({ newComments });
  }
);

module.exports = router;
