import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("refreshToken").redirect("/");
  console.log(res);
});
module.exports = router;
