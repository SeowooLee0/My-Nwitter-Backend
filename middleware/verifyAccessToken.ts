import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

module.exports.verifyAccessToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let decoded = jwt.verify(
      req.cookies.accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.email = decoded.email;
  } catch (error: any) {
    return res.status(419).json({
      data: req.headers,
      code: 419,
      message: "토큰이 만료되었습니다.",
    });
  }
  next();
};
