import express, { Request, Response, NextFunction } from "express";
import { AutoIncrement } from "sequelize-typescript";
import { and } from "sequelize/types";
import { Comments } from "../models/comments";
import { Follow } from "../models/follow";
import sequelize from "../models/index";

import { Users } from "../models/user";
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");
const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const currentUser: Users[] = await Users.findOne({
      where: {
        email: req.email,
      },
    }).then((r: any) => {
      return r.user_id;
    });

    if (req.token === "login again") {
      res.json("login again");
    } else if (req.token === "refresh ok") {
      await Follow.create({
        user_id: req.body.user_id,
        follower_id: currentUser,
      }).then((result) => {
        res.status(201).json(result);
      });
    }
  }
);

router.post(
  "/delete",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const currentUser: Users[] = await Users.findOne({
      where: {
        email: req.email,
      },
    }).then((r: any) => {
      return r.user_id;
    });

    if (req.token === "login again") {
      res.json("login again");
    } else if (req.token === "refresh ok") {
      await Follow.destroy({
        where: {
          user_id: req.body.user_id,
          follower_id: currentUser,
        },
      }).then((result) => {
        res.status(201).json(result);
      });
    }
  }
);

module.exports = router;
