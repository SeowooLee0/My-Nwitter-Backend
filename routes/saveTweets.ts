import express, { Request, Response, NextFunction, Router } from "express";
import { Tweets } from "../models/tweets";

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  await Tweets.create({
    number: req.body.number,
    content: req.body.content,
    write_date: `${new Date()}`,
  }).then((result) => {
    res.status(201).json(result);
  });
});

module.exports = router;
