import express, { Request, Response, NextFunction } from "express";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
import sequelize from "../models/index";
const fs = require("fs");

const multer = require("multer");

const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const path = require("path");

const router = express.Router();

fs.readdir("src/public/uploads", (error: any) => {
  // uploads 폴더 없으면 생성
  if (error) {
    fs.readdir("public", (error: any) => {
      if (error) {
        fs.mkdirSync("public/");
      }
      fs.mkdirSync("public/uploads");
    });
  }
});

const profileStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "src/public/uploads/");
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const tweetsStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // console.log(req, file);
    cb(null, "src/public/tweets/");
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: profileStorage }).single("profile_img");
const uploadTweets = multer({ storage: tweetsStorage }).fields([
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

    await Users.update(
      {
        profile: res.req.file.filename,
      },
      {
        where: { email: req.body.id },
      }
    ).then((result: any) => {
      res.json({
        success: true,
        image: res.req.file.path,
        fileName: res.req.file.filename,
      });
      console.log(res.req.file);
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
          upload_file: res.req.files.upload_file[0].filename,
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
