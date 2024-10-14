import express, { Request, Response, NextFunction } from "express";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
import sequelize from "../models/index";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import { profile } from "console";
const fs = require("fs");
require("dotenv").config();

const multer = require("multer");

const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const path = require("path");

const router = express.Router();

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new aws.S3() as any;
const bucket = process.env.AWS_S3_BUCKET_NAME as string;

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
  Storage: multerS3({
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

router.post("/", (req: any, res: any) => {
  upload(req, res, async (err: any) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, err });
    }

    const imageUrl = req.file.location;
    await Users.update(
      {
        profile: imageUrl,
      },
      {
        where: { email: req.body.id },
      }
    ).then((result: any) => {
      res
        .json({
          success: true,
          image: imageUrl,
          fileName: res.req.key,
        })
        .catch((err: Error) => {
          res.status(500).json({ success: false, err });
        });
    });
  });
});

router.post(
  "/tweets",
  async (req: any, res: any, next: NextFunction) => {
    uploadTweets(req, res, async (err: any) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, err });
      }

      await Users.findOne({
        where: { user_id: req.body.id },
      }).then(async (result: any) => {
        await Tweets.create({
          user_id: result.user_id,
          email: result.email,
          content: req.body.tweet,
          tag: [req.body.tag],
          upload_file: res.req.files.upload_file[0].key,
          write_date: sequelize.development.literal(`now()`),
        }).then(async (r) => {
          res.status(201).json(r);
          await Likes.create({
            tweet_id: r.tweet_id,
          });
        });
      });
    });
  }
  // }
);

module.exports = router;
