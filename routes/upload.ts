import express, { Request, Response, NextFunction } from "express";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
import sequelize from "../models/index";
import multerS3 from "multer-s3";

import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { profile } from "console";
const fs = require("fs");
require("dotenv").config();

const multer = require("multer");

const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const path = require("path");

const router = express.Router();

const s3 = new S3Client([
  {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
]);

const bucket = process.env.AWS_S3_BUCKET_NAME as string;

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucket,
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now().toString()}_${file.originalname}`);
    },
    acl: "public-read",
  }),
});

// Multer 설정: 트윗 이미지 업로드 전용
const tweetUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucket,
    key: (req, file, cb) => {
      cb(null, `tweets/${Date.now().toString()}_${file.originalname}`);
    },
    acl: "public-read",
  }),
});

// 트윗 업로드 라우터에서 single("profile_img") 설정
router.post(
  "/",
  tweetUpload.single("profile_img"),
  (req: Request, res: Response) => {
    console.log(req.file, "여기 실행중", req);
    try {
      console.log(req.file, "여기 실행중"); // 파일 정보 확인

      res.status(200).json({ message: "파일 업로드 성공", file: req.file });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "파일 업로드 실패", error });
    }
  }
);

export const uploadImage = async (req: Request, res: Response) => {
  const multerFile = req.file as Express.MulterS3.File;
  const imageURL = multerFile.location;
  const imageName = multerFile.key;
  const imageSize = multerFile.size;
  if (imageURL) {
    res.status(200);
    res.json({
      success: true,
      imageName: imageName,
      imageSize: imageSize,
      imageURL: imageURL,
    });
  } else {
    res.status(400);
    res.json({
      success: false,
    });
  }
};

// 트윗 업로드 라우터에서 single("profile_img") 설정
router.post(
  "/tweets",
  tweetUpload.single("profile_img"),

  (req: Request, res: Response) => {
    console.log(req.file, "/tweets여기 실행중", req);
    try {
      console.log(req.file); // 파일 정보 확인
      res.status(200).json({ message: "파일 업로드 성공", file: req.file });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "파일 업로드 실패", error });
    }
  }
);

module.exports = router;
