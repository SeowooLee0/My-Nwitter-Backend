import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

module.exports.verifyAccessToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;
  // const token = authorization.split("Bearer ")[1];

  try {
    let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.email = decoded.email;
  } catch (error: any) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다.",
      });
    }
    res.status(400).json({
      data: null,
      message: "invalid access token",
    });
  }
  next();
};
