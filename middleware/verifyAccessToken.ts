import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

module.exports.verifyAccessToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["x-vercel-proxy-signature"];
  console.log(`authorization=${authorization}`);

  const token: any = authorization.split("Bearer ")[1];

  // console.log(token, req.headers["x-vercel-proxy-signature"]);
  // const token = authorization.split("Bearer ")[1];
  // const token = authorization.split("Bearer ")[1];
  let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  try {
    console.log(`decoded=${decoded}`);
    console.log(decoded, req.email);
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
