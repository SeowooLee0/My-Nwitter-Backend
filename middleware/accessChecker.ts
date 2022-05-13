import { NextFunction, Request, Response } from "express";
import { Users } from "../models/user";

const jwt = require("jsonwebtoken");

export const accessCheker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["authorization"];
  const token = authorization && authorization.split(" ")[1];
  console.log(token);
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    async (err: any, data: any) => {
      if (err) {
        //해독할 시 에러..(해독할 수 없는 것)
        res.status(400).json({
          data: null,
          message: "invalid access token",
        });
      } else {
        const userInfo = await Users.findOne({
          where: { email: data.email }, //해독하여 얻은 payload의 userId 속성.
        });
        if (!userInfo) {
          // 일치하는 유저가 없을 경우
          res.status(400).json({
            data: null,
            message: "access token has been tempered",
          });
        } else {
          // 일치하는 유저가 있을 경우 필요한 데이터(id, userId, email, createdAt, updatedAt)를 응답에 담아 반환합니다.
          const { email } = userInfo;
          res.status(200).json({
            data: {
              userInfo: { email },
            },
            message: "ok",
          });
        }
      }
    }
  );
  next();
};
