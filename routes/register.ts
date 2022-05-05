import express, { Request, Response, NextFunction } from "express";
import { where } from "sequelize/types";
import sequelize from "../models";
import { Users } from "../models/user";
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const emailExists = await Users.findOne({ where: { email: req.body.email } });
  if (emailExists) {
    return res.status(400).json({ message: "이미 사용중인 이메일입니다." });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  await Users.create({
    email: req.body.email,
    password: hashedPassword,
  }).then((result) => {
    res.status(201).json(result);
  });
});

module.exports = router;
