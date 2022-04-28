import { table } from "console";
import express, { Request, Response, NextFunction, Router } from "express";
import { AutoIncrement } from "sequelize-typescript";
import sequelize from "../models";
import { Tweets } from "../models/tweets";

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  await Tweets.create({
    content: req.body.content,
    write_date: sequelize.literal(`now()`),
  }).then((result) => {
    res.status(201).json(result);
  });
});

module.exports = router;
