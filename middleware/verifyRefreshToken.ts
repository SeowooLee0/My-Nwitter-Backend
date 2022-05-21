import express, { Request, Response, NextFunction } from "express";
import { Users } from "../models/user";
const router = express.Router();
const jwt = require("jsonwebtoken");

module.exports.verifyRefreshToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.refreshToken;
  let decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  try {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    req.token = "refresh ok";

    req.email = decoded.email;
  } catch (error: any) {
    req.token = "login again";
  }
  next();
};
