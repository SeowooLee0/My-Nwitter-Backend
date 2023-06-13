import express, { Request, Response, NextFunction } from "express";
import { Users } from "../models/user";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const generateAccessToken = (email: any) => {
    return jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m",
    });
  };

  // refersh token을 secret key  기반으로 생성
  const generateRefreshToken = (email: any) => {
    return jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "100m",
    });
  };

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

    let accessToken = generateAccessToken(email);
    let refreshToken = generateRefreshToken(email);

    res
      .cookie("refreshToken", refreshToken, {
        secure: true,
        sameSite: "none",
        httpOnly: true,
      })
      .cookie("accessToken", accessToken, {
        secure: true,
        sameSite: "none",
        httpOnly: true,
      })
      .status(200)
      .json({ message: "ok" });
  } catch (err: any) {
    return res.status(400).send({ err: err.message });
  }
});

// const authenticateAccessToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let authHeader = req.headers["Authorization"];
//   let token = authHeader && authHeader.split();
//   console.log(authHeader);
//   jwt.verify(
//     token,
//     process.env.ACCESS_TOKEN_SECRET,
//     async (err: any, data: any) => {
//       if (err) {
//         //해독할 시 에러..(해독할 수 없는 것)
//         res.status(400).json({
//           data: null,
//           message: "invalid access token",
//         });
//       } else {
//         const userInfo = await Users.findOne({
//           where: { email: data.email }, //해독하여 얻은 payload의 userId 속성.
//         });
//         if (!userInfo) {
//           // 일치하는 유저가 없을 경우
//           res.status(400).json({
//             data: null,
//             message: "access token has been tempered",
//           });
//         } else {
//           // 일치하는 유저가 있을 경우 필요한 데이터(id, userId, email, createdAt, updatedAt)를 응답에 담아 반환합니다.
//           const { id, email, createdAt, updatedAt } = userInfo;
//           res.status(200).json({
//             data: {
//               userInfo: { id, email, createdAt, updatedAt },
//             },
//             message: "ok",
//           });
//         }
//       }
//     }
//   );
// };

module.exports = router;
