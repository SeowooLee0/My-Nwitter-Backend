import { Users } from "../models/user";
import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.refreshToken;

  try {
    const data = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET); // 쿠키에 담긴 정보를 해독한 값
    const userInfo = await Users.findOne({ where: { email: data.email } });

    if (!data) {
      // 유효하지 않거나, 해독이 불가한 토큰인 경우
      return res.json({
        data: null,
        message: "invalid refresh token, please log in again",
      });
    }
    if (userInfo) {
      const payload = {
        email: data.email,
      };
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      return res.cookie("accessToken", accessToken).json({
        email: data.email,
        message: "ok",
      });
    }
    return res.json({
      data: null,
      message: "refresh token has been tempered",
    });
  } catch (err) {
    // 유효하지 않거나, 해독이 불가한 토큰인 경우
    return res.json({
      data: null,
      message: "invalid refresh token, please log in again",
    });
  }

  // jwt.verify 할 때 네 번째 인자로 콜백 함수를 받는데 err인 경우와 decoded 된 결과값을 파라미터로 갖는다
  // 때문에 에러 핸들링을 콜백 함수 안에서 할 수 있지만 거기서 하지 않으면 에러가 catch문으로 들어와서 그 안에서 에러 핸들링 해줄 수 있다.
});

module.exports = router;
