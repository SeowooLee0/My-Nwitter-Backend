import { Users } from "../models/user";
const fs = require("fs");
const express = require("express");
const multer = require("multer");

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

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "src/public/uploads/");
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).single("profile_img");

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
      console.log(req.file);
    });
  });
});

module.exports = router;
