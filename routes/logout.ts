import express, { Request, Response, NextFunction, Router } from "express";
import { Tweets } from "../models/tweets";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("refreshToken").redirect("/");
});
module.exports = router;
