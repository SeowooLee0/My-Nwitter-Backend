import express, { Request, Response, NextFunction, Router } from "express";
import { Op } from "sequelize";
import { Bookmark } from "../models/bookmark";
import { Comments } from "../models/comments";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");

const router = express.Router();

router.get(
  "/",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const userData = await Users.findOne({
      where: { email: req.email },
    });
    let currentUser = userData?.user_id;
    // console.log(res.req.query);
    //리트윗한 데이터
    let retweets: any = [];
    //좋아요 누른 데이터
    let likes: any = [];

    // 현재 로그인한 유저가 작성한 트윗 모두 가져오기
    const userTweets = await Tweets.findAll({
      include: [Likes, Comments, Bookmark, Users],
      where: {
        email: req.email,
      },
    }).then(async (d: any) => {
      const results = await Promise.all(
        d.map(async (d: any) => {
          let isLike = false;
          let isBookmark = false;
          let retweet_data: any = [];
          if (d.reply_tweet_id !== null) {
            const tweetExists = await Tweets.findByPk(d.reply_tweet_id);
            if (tweetExists) {
              await Tweets.findOne({
                include: [Likes, Bookmark, Users],
                where: { tweet_id: d.reply_tweet_id },
              }).then((t: any) => {
                let RLike = false;
                let RBookmark = false;
                if (
                  t.like.some((i: any) => {
                    return i.user_id === currentUser;
                  })
                ) {
                  RLike = true;
                }
                if (
                  t.bookmark.some((i: any) => {
                    return i.user_id === currentUser;
                  })
                ) {
                  RBookmark = true;
                }

                let data = {
                  tweet_id: t.tweet_id,
                  profile: t.user.profile,
                  content: t.content,
                  email: t.email,
                  like: t.like,
                  tag: t.tag,
                  user_id: t.user_id,
                  write_date: t.write_date,
                  upload_file: t.upload_file,
                  reply_tweet_id: t.reply_tweet_id,
                  is_like: RLike,
                  is_bookmark: RBookmark,
                  comment: [],
                  is_opened: false,
                  retweet_opened: false,
                };

                retweet_data.push(data);
              });
            }
          }
          if (
            d.like.some((i: any) => {
              return i.user_id === currentUser;
            })
          ) {
            isLike = true;
          }

          if (
            d.bookmark.some((i: any) => {
              return i.user_id === currentUser;
            })
          ) {
            isBookmark = true;
          }
          let finalData = {
            tweet_id: d.tweet_id,
            profile: d.user.profile,
            content: d.content,
            email: d.email,
            like: d.like,
            tag: d.tag,
            user_id: d.user_id,
            write_date: d.write_date,
            upload_file: d.upload_file,
            reply_tweet_id: d.reply_tweet_id,
            is_like: isLike,
            is_bookmark: isBookmark,
            comment: [],
            is_opened: false,
            retweet_opened: false,
            retweet_data: retweet_data,
          };
          if (res.req.query.type == "retweets") {
            d.reply_tweet_id !== null && retweets.push(finalData);
          }
          if (res.req.query.type == "likes") {
            isLike == true && likes.push(finalData);
          }

          return finalData;
        })
      );

      return (
        (res.req.query.type == "tweets" && results) ||
        (res.req.query.type == "retweets" && retweets) ||
        (res.req.query.type == "likes" && likes)
      );
    });

    //데이터가 많으면 쉽지않다. api분리하거나 type에 따라서 ,
    res.status(200).json({
      data: userData,
      tweetData: userTweets,
      email: req.email,
    });
  }
);

router.get(
  "/chatUser",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const { user_id } = res.req.query;
    const userData = await Users.findOne({
      where: { user_id: user_id },
    });
    res.status(200).json(userData);
  }
);

module.exports = router;
