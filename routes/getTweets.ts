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
import { Bookmark } from "../models/bookmark";
import { DataType } from "sequelize-typescript";
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

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
  verifyAccessToken,

  async (req: any, res: Response, next: NextFunction) => {
    const currentUser: any = await Users.findOne({
      where: {
        email: req.email,
      },
    });

    let pageNum = Number(res.req.query.pageParam);

    console.log(res.req.query.pageParam);
    // if (pageNum == undefined) {
    //   pageNum = 1;
    // }
    let offset = 0;
    if (pageNum > 1) {
      offset = 10 * (pageNum - 1);
    }

    const selectCurrentTweets = await Tweets.findAll({
      include: [Likes, Bookmark, Users],
      order: [["tweet_id", "desc"]],
      offset: offset,
      limit: 10,
    }).then(async (d: any) => {
      return await Promise.all(
        d.map(async (d: any) => {
          let isLike = false;
          let isBookmark = false;
          let retweet_data: any = [];

          if (
            d.like.some((i: any) => {
              return i.user_id === currentUser.user_id;
            })

            // d.like.find((l: any) => {
            //   return l.user_id === currentUser;
            // })
          ) {
            isLike = true;
          }

          if (
            d.bookmark.some((i: any) => {
              return i.user_id === currentUser.user_id;
            })
          ) {
            isBookmark = true;
          }

          if (d.reply_tweet_id !== null) {
            await Tweets.findOne({
              include: [Likes, Bookmark, Users],
              where: { tweet_id: d.reply_tweet_id },
            }).then((t: any) => {
              let RLike = false;
              let RBookmark = false;
              if (
                t.like.some((i: any) => {
                  return i.user_id === currentUser.user_id;
                })
              ) {
                RLike = true;
              }
              if (
                t.bookmark.some((i: any) => {
                  return i.user_id === currentUser.user_id;
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

          return {
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
        })
      );
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
      user_id: currentUser.user_id,
      profile: currentUser.profile,
      totalPageNumber: totalPageNumber,
      // dataLength: selectCurrentTweets.length,
    });
  }
);

router.get(
  "/bookmark",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    const currentUser: Users[] = await Users.findOne({
      where: {
        email: req.email,
      },
    }).then((r: any) => {
      return r.user_id;
    });

    const bookmarkData = await Bookmark.findAll({
      include: [Tweets, Users],

      where: {
        user_id: currentUser,
      },
    }).then(async (d: any) => {
      const results = await Promise.all(
        d.map(async (d: any) => {
          const like: any = await Likes.findAll({
            where: {
              tweet_id: d.tweet_id,
            },
          });
          let isLike = false;
          let isBookmark = true;
          let retweet_data: any = [];
          if (d.tweets.reply_tweet_id !== null) {
            const t: any = await Tweets.findOne({
              include: [Likes, Bookmark, Users],
              where: { tweet_id: d.tweets.reply_tweet_id },
            });

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
          }
          if (
            like.some((i: any) => {
              return i.user_id === currentUser;
            })
          ) {
            isLike = true;
          }

          return {
            tweet_id: d.tweets.tweet_id,
            profile: d.users.profile,
            content: d.tweets.content,
            email: d.tweets.email,
            like: like,
            tag: d.tweets.tag,
            user_id: d.tweets.user_id,
            write_date: d.tweets.write_date,
            upload_file: d.tweets.upload_file,
            reply_tweet_id: d.tweets.reply_tweet_id,
            is_like: isLike,
            is_bookmark: isBookmark,
            comment: [],
            is_opened: false,
            retweet_opened: false,
            retweet_data: retweet_data,
          };
        })
      );

      return results;
    });
    res.status(200).json(bookmarkData);
  }
);

router.get(
  "/top",
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    let pageNum = Number(res.req.query.currentPage); // 요청 페이지 넘버
    const { search } = res.req.query;
    // console.log(pageNum);
    if (Number.isNaN(pageNum)) {
      pageNum == 0;
    }

    let offset = 0;
    if (pageNum > 1) {
      offset = 10 * (pageNum - 1);
    }

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
      include: [Likes, Bookmark, Users],
      offset: offset,
      limit: 10,
      where: {
        [Op.or]: [
          { content: { [Op.like]: [`%${search}%`] } },
          { tag: { [Op.like]: [`%${search}%`] } },
        ],
      },
    }).then(async (d: any) => {
      // let retweet_data: any = [];
      const results = await Promise.all(
        //pending상태가 아니라 제대로 된 데이터를 다 받아오고 return
        d.map(async (d: any) => {
          let isLike = false;
          let isBookmark = false;
          let retweet_data: any = [];
          if (d.reply_tweet_id !== null) {
            const t: any = await Tweets.findOne({
              include: [Likes, Bookmark, Users],
              where: { tweet_id: d.reply_tweet_id },
            });
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
          return {
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
        })
      );

      return results;
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
    let pageNum = Number(res.req.query.pageCount); // 요청 페이지 넘버

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
      include: [Likes, Bookmark, Users],
      offset: offset,
      limit: 10,
      where: {
        [Op.or]: [
          { content: { [Op.like]: [`%${search}%`] } },
          { tag: { [Op.like]: [`%${search}%`] } },
        ],
      },
      order: [["tweet_id", "DESC"]],
    }).then(async (d: any) => {
      const results = await Promise.all(
        d.map(async (d: any) => {
          let isLike = false;
          let isBookmark = false;
          let retweet_data: any = [];
          if (d.reply_tweet_id !== null) {
            const t: any = await Tweets.findOne({
              include: [Likes, Bookmark, Users],
              where: { tweet_id: d.reply_tweet_id },
            });
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
          return {
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
        })
      );

      return results;
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
    let pageNum = Number(res.req.query.pageCount); // 요청 페이지 넘버
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
  }
);

module.exports = router;
