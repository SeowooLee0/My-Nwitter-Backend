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
    bucket: bucket, // S3 버킷 이름
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now().toString()}_${file.originalname}`); // 파일 이름 설정
    },
    acl: "public-read", // 파일 접근 권한 설정
  }),
});

const tweetsUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucket, // S3 버킷 이름
    acl: "public-read", // 파일을 공개적으로 접근 가능하도록 설정
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname }); // 메타데이터 설정 (필요에 따라 수정 가능)
    },
    contentType: multerS3.AUTO_CONTENT_TYPE, // 파일의 MIME 타입을 자동으로 설정
    key: (req, file, cb) => {
      // 파일 경로 설정
      cb(
        null,
        `tweets_images/${Date.now()}_${path.basename(file.originalname)}`
      );
    },
  }),
});
const uploadTweets = tweetsUpload.fields([
  { name: "upload_file", maxCount: 1 }, // 이미지 파일 필드 (파일 1개 허용)
  { name: "id" }, // 사용자 ID 필드
  { name: "tweet" }, // 트윗 내용 필드
  { name: "tag" }, // 태그 필드
]);

// 프로필 이미지 업로드 라우터
router.post("/", (req: any, res: any) => {
  upload(req, res, async (err: any) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, err });
    }

    try {
      const imageUrl = req.file.location;
      await Users.update(
        {
          profile: imageUrl,
        },
        {
          where: { email: req.body.id },
        }
      );
      res.json({
        success: true,
        image: imageUrl,
        fileName: req.file.key, // res.req.key 대신 req.file.key 사용
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, err });
    }
  });
});

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

// 트윗 업로드 라우터
router.post(
  "/tweets",
  upload.single("profile_img"),
  async (req: Request, res: Response) => {
    try {
      console.log("트윗 업로드 라우터 호출됨");

      // 파일 정보는 req.file에 저장됨
      console.log(req.file);

      res.status(200).json({ message: "파일 업로드 성공", file: req.file });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "파일 업로드 실패", error });
    }
  }
);

module.exports = router;
