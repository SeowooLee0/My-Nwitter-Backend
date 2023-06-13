import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

module.exports.verifyAccessToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token: any =
    req.headers["x-vercel-proxy-signature"].split("Bearer ")[1];

  console.log(token, req.headers["x-vercel-proxy-signature"]);
  // const token = authorization.split("Bearer ")[1];
  // const token = authorization.split("Bearer ")[1];

  try {
    let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.email = decoded.email;
  } catch (error: any) {
    console.log(error);
    return res.status(419).json({
      data: req.headers,
      code: 419,
      message: "토큰이 만료되었습니다.",
    });
  }
  next();
};
