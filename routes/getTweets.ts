import express, { Request, Response, NextFunction, Router } from "express";
import { read } from "fs";
import { JSONB, literal, Op, or } from "sequelize";
import { STRING } from "sequelize";
import { JSON } from "sequelize";
import { where } from "sequelize/types";
import { Json } from "sequelize/types/utils";
import { Comments } from "../models/comments";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
import sequelize from "../models/index";
import { count } from "console";
import { Follow } from "../models/follow";
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const router = express.Router();

router.get(
  "/",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const allTweets: Tweets[] = await Tweets.findAll({
      include: [Comments],
    });
    res.status(200).json({ data: allTweets, email: req.email });
  }
);

router.get(
  "/select",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const currentUser: Users[] = await Users.findOne({
      where: {
        email: req.email,
      },
    }).then((r: any) => {
      return r.user_id;
    });

    let pageNum = Number(res.req.query.currentPage);

    console.log(res.req.query.currentPage); // 요청 페이지 넘버
    let offset = 0;
    if (pageNum > 1) {
      offset = 10 * (pageNum - 1);
    }

    const selectCurrentTweets = await Tweets.findAll({
      include: [Likes],
      offset: offset,
      limit: 10,
    }).then((d: any) => {
      return d.map((d: any) => {
        let isLike = false;

        if (
          d.like.some((i: any) => {
            return i.user_id === currentUser;
          })

          // d.like.find((l: any) => {
          //   return l.user_id === currentUser;
          // })
        ) {
          isLike = true;
        }

        return {
          tweet_id: d.tweet_id,
          content: d.content,
          email: d.email,
          like: d.like,
          tag: d.tag,
          user_id: d.user_id,
          write_date: d.write_date,
          upload_file: d.upload_file,
          is_like: isLike,
          comment: [],
          is_opened: false,
        };
        // if (
        //   d.like.find((l: any) => {
        //     return l.user_id === currentUser;
        //   }) == undefined
        // ) {
        //   return {
        //     tweet_id: d.tweet_id,
        //     content: d.content,
        //     email: d.email,
        //     like: d.like,
        //     tag: d.tag,
        //     user_id: d.user_id,
        //     write_date: d.write_date,
        //     is_like: false,
        //     comment: [],
        //     is_opened: false,
        //   };
        // }
      });
    });

    // let likeData = await Likes.findAll().then((Likes: any) => {
    //   return Likes.map((d: any) => {
    //     if (d.user_id == null) {
    //       return {
    //         tweet_id: d.tweet_id,
    //         is_like: false,
    //       };
    //     }
    //     if (d.user_id == req.email) {
    //       return {
    //         tweet_id: d.tweet_id,
    //         is_like: true,
    //       };
    //     }
    //   });
    // });
    // let data = { , likeData };
    // console.log(likeData.filter((d: any) => d.tweet_id == "1"));

    let count = await Tweets.count();
    let totalPageNumber = Math.round((await Tweets.count()) / 10);

    res.status(200).json({
      data: selectCurrentTweets,
      count,
      email: req.email,
      totalPageNumber: totalPageNumber,
      // dataLength: selectCurrentTweets.length,
    });
  }
);

router.get(
  "/top",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    let pageNum = Number(res.req.query.currentPage); // 요청 페이지 넘버

    let offset = 0;
    if (pageNum > 1) {
      offset = 10 * (pageNum - 1);
    }

    const { search } = res.req.query;
    let count = await Tweets.count({
      where: {
        [Op.or]: [
          { content: { [Op.like]: [`%${search}%`] } },
          { tag: { [Op.like]: [`%${search}%`] } },
        ],
      },
    });

    const currentUser: Users[] = await Users.findOne({
      where: {
        email: req.email,
      },
    }).then((r: any) => {
      return r.user_id;
    });
    const topUser = await Tweets.findAll({
      include: [Likes, Comments],
      offset: offset,
      limit: 10,
      where: {
        [Op.or]: [
          { content: { [Op.like]: [`%${search}%`] } },
          { tag: { [Op.like]: [`%${search}%`] } },
        ],
      },
    }).then((d: any) => {
      return d.map((d: any) => {
        let isLike = false;

        if (
          d.like.some((i: any) => {
            return i.user_id === currentUser;
          })
        ) {
          isLike = true;
        }

        return {
          tweet_id: d.tweet_id,
          content: d.content,
          email: d.email,
          like: d.like,
          tag: d.tag,
          user_id: d.user_id,
          write_date: d.write_date,
          upload_file: d.upload_file,
          is_like: isLike,
          comment: [],
          is_opened: false,
        };
      });
    });
    res.status(200).json({
      data: topUser,
      count: count,
    });
  }
);

router.get(
  "/latest",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    let pageNum = Number(res.req.query.currentPage); // 요청 페이지 넘버

    let offset = 0;
    if (pageNum > 1) {
      offset = 10 * (pageNum - 1);
    }
    const { search } = res.req.query;
    let count = await Tweets.count({
      where: {
        [Op.or]: [
          { content: { [Op.like]: [`%${search}%`] } },
          { tag: { [Op.like]: [`%${search}%`] } },
        ],
      },
    });

    const currentUser: Users[] = await Users.findOne({
      where: {
        email: req.email,
      },
    }).then((r: any) => {
      return r.user_id;
    });
    const latestData = await Tweets.findAll({
      include: [Likes, Comments],
      offset: offset,
      limit: 10,
      where: {
        [Op.or]: [
          { content: { [Op.like]: [`%${search}%`] } },
          { tag: { [Op.like]: [`%${search}%`] } },
        ],
      },
      order: [["tweet_id", "DESC"]],
    }).then((d: any) => {
      return d.map((d: any) => {
        let isLike = false;

        if (
          d.like.some((i: any) => {
            return i.user_id === currentUser;
          })
        ) {
          isLike = true;
        }

        return {
          tweet_id: d.tweet_id,
          content: d.content,
          email: d.email,
          like: d.like,
          tag: d.tag,
          user_id: d.user_id,
          write_date: d.write_date,
          is_like: isLike,
          comment: [],
          is_opened: false,
          upload_file: d.upload_file,
        };
      });
    });

    res.status(200).json({
      data: latestData,
      count: count,
    });
  }
);

router.get(
  "/people",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    let pageNum = Number(res.req.query.currentPage); // 요청 페이지 넘버
    let offset = 0;
    if (pageNum > 1) {
      offset = 10 * (pageNum - 1);
    }
    const { search } = res.req.query;
    let count = await Users.count({
      where: {
        email: { [Op.like]: [`%${search}%`] },
      },
    });
    const currentUser: Users[] = await Users.findOne({
      where: {
        email: req.email,
      },
    }).then((r: any) => {
      return r.user_id;
    });
    const peopleData = await Users.findAll({
      where: {
        email: { [Op.like]: [`%${search}%`] },
      },
      include: [Follow],
      offset: offset,
      limit: 10,
    }).then((d: any) => {
      return d.map((d: any) => {
        let is_follow = false;
        if (
          d.follow.some((i: any) => {
            return i.follower_id === currentUser;
          })
        ) {
          is_follow = true;
        }

        return {
          user_id: d.user_id,
          following: is_follow,
          email: d.email,
          profile: d.profile,
        };
      });
    });

    res.status(200).json({
      data: peopleData,
      count: count,
    });
    console.log(peopleData);
  }
);

module.exports = router;
