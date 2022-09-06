import express, { Request, Response, NextFunction, Router } from "express";
import { Users } from "../models/user";
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const router = express.Router();

router.get(
  "/",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const userData = await Users.findOne({
      where: { email: req.email },
    });
    res.status(200).json({ data: userData, email: req.email });
  }
);
module.exports = router;
