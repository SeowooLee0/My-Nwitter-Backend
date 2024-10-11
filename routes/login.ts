import express, { Request, Response, NextFunction } from "express";
import { Users } from "../models/user";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const generateAccessToken = (email: any) => {
    return jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
  };

  // refersh token을 secret key  기반으로 생성
  const generateRefreshToken = (email: any) => {
    return jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "3h",
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

    console.log(accessToken, refreshToken);
    res
      .cookie("refreshToken", refreshToken, {
        sameSite: "none", // CORS에서 다른 도메인 간 쿠키를 허용하기 위해 "none" 사용
        httpOnly: true, // 클라이언트 측에서 접근하지 못하도록 설정 (보안 강화)
      })
      .cookie("accessToken", accessToken, {
        sameSite: "none", // 다른 도메인 간 쿠키 허용
        httpOnly: false, // accessToken은 클라이언트에서 접근 가능
      })
      .status(200)
      .json({ message: "ok", data: res.cookie });
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
