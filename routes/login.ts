import e from "express";
import express, { Request, Response, NextFunction } from "express";
import { access } from "fs";
import { where } from "sequelize/types";
import sequelize from "../models";
import { Users } from "../models/user";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).send("존재하지 않는 계정입니다.");
    }

    const VaildPassword = await bcrypt.compare(password, user.password);
    if (!VaildPassword) {
      return res.status(400).send("패스워드를 제대로 입력하세요");
    }

    const accessToken = () => {
      return jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      });
    };

    const refreshToken = () => {
      return jwt.sign({ email: email }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "180 days",
      });
    };

    res.json({ accessToken, refreshToken });
  } catch (err: any) {
    return res.status(400).send({ err: err.message });
  }
});

module.exports = router;
