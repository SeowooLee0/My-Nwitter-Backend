import express, { Request, Response, NextFunction } from "express";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
import sequelize from "../models/index";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";
import { profile } from "console";
const fs = require("fs");
require("dotenv").config();

const multer = require("multer");

const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const path = require("path");

const router = express.Router();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  logger: console, // 로깅 활성화
});

// 이후에 S3, DynamoDB 등의 AWS 서비스 사용
const s3 = new AWS.S3() as any;

const bucket = process.env.AWS_S3_BUCKET_NAME as string;

console.log(bucket, s3);
const profileUpload = multer({
  storage: multerS3({
    s3: s3,
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
    s3: s3,
    bucket: bucket, // Your S3 bucket name
    acl: "public-read", // Make files publicly accessible if needed
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(
        null,
        `tweets_images/${Date.now()}_${path.basename(file.originalname)}`
      ); // Save files under 'tweets_images' folder in S3
    },
  }),
});

const upload = profileUpload.single("profile_img");
const uploadTweets = tweetsUpload.fields([
  { name: "upload_file" },
  { name: "id" },
  { name: "tweet" },
  { name: "tag" },
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

// 트윗 업로드 라우터
router.post("/tweets", async (req: any, res: any, next: NextFunction) => {
  uploadTweets(req, res, async (err: any) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, err });
    }

    // 파일 업로드 검증
    if (!req.files.upload_file || req.files.upload_file.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    console.log("작동중");

    try {
      const user = await Users.findOne({
        where: { user_id: req.body.id },
      });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const tweet = await Tweets.create({
        user_id: user.user_id,
        email: user.email,
        content: req.body.tweet,
        tag: [req.body.tag],
        upload_file: req.files.upload_file[0].key, // res.req.files 대신 req.files
        write_date: sequelize.development.literal(`now()`),
      });

      await Likes.create({
        tweet_id: tweet.tweet_id,
      });

      console.log("작동중", req.files);
      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        fileUrl: req.file.location, // S3에 저장된 파일의 URL
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, err });
    }
  });
});

module.exports = router;
