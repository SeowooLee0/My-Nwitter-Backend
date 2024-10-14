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

const s3Client = new S3Client([
  {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
]);

const bucket = process.env.AWS_S3_BUCKET_NAME as string;

const profileUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucket, // Your S3 bucket name
    acl: "public-read", // Make files publicly accessible if needed
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(
        null,
        `profile_images/${Date.now()}_${path.basename(file.originalname)}`
      ); // Save files under 'profile_images' folder in S3
    },
  }),
});

const tweetsUpload = multer({
  storage: multerS3({
    s3: s3Client,
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
const upload = profileUpload.single("profile_img");
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
router.post("/tweets", upload, async (req: Request, res: Response) => {
  console.log("트윗 업로드 라우터 호출됨");
  uploadImage;

  // uploadTweets(req, res, async (err: any) => {
  //   if (err) {
  //     console.log(err);
  //     return res.status(500).json({ success: false, err });
  //   }

  //   // 파일 업로드 검증
  //   if (
  //     !req.files ||
  //     !req.files.upload_file ||
  //     req.files.upload_file.length === 0
  //   ) {
  //     return res
  //       .status(400)
  //       .json({ success: false, message: "No file uploaded" });
  //   }

  //   console.log("파일 업로드 중...");

  //   try {
  //     // 사용자 ID로 사용자 찾기
  //     const user = await Users.findOne({
  //       where: { user_id: req.body.id },
  //     });

  //     if (!user) {
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "User not found" });
  //     }

  //     // 트윗 데이터베이스에 저장
  //     const tweet = await Tweets.create({
  //       user_id: user.user_id,
  //       email: user.email,
  //       content: req.body.tweet, // 트윗 내용
  //       tag: [req.body.tag], // 트윗 태그 (배열로 저장)
  //       upload_file: req.files.upload_file[0].key, // S3에 저장된 파일 경로
  //       write_date: sequelize.development.literal(`now()`), // 트윗 작성 날짜
  //     });

  //     // 트윗에 대한 좋아요 초기화
  //     await Likes.create({
  //       tweet_id: tweet.tweet_id,
  //     });

  //     console.log("트윗 업로드 완료");

  //     // 성공적으로 저장된 파일 URL과 함께 응답
  //     res.status(200).json({
  //       success: true,
  //       message: "Tweet uploaded successfully",
  //       fileUrl: req.files.upload_file[0].location, // S3에 저장된 파일의 URL
  //       tweet,
  //     });
  //   } catch (err) {
  //     console.log("트윗 업로드 실패:", err);
  //     res.status(500).json({ success: false, err });
  //   }
  // });
});
module.exports = router;
