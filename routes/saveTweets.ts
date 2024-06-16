import express, { Request, Response, NextFunction } from "express";
import { send } from "process";
import { AutoIncrement } from "sequelize-typescript";
import { Bookmark } from "../models/bookmark";
import sequelize from "../models/index";
import { Likes } from "../models/like";
import { Tweets } from "../models/tweets";
import { Users } from "../models/user";
import { Comments } from "../models/comments";
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { verifyRefreshToken } = require("../middleware/verifyRefreshToken");
const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    await Users.findOne({
      attributes: ["user_id"],
      where: { email: req.email },
    }).then(async (result: any) => {
      await Tweets.create({
        user_id: result.user_id,
        email: req.email,
        content: req.body.content,
        tag: req.body.tag,
        write_date: sequelize.development.literal(`now()`),
        reply_tweet_id: req.body.reply_tweet_id,
      }).then(async (result) => {
        res.status(201).json(result);
        // res.status(201).json(result);

        await Likes.create({
          tweet_id: result.tweet_id,
        });
        await Bookmark.create({
          tweet_id: result.tweet_id,
          user_id: null,
        });
      });
    });
  }
);

router.post(
  "/delete",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      // 트랜잭션 시작
      const transaction = await sequelize.development.transaction();

      // Tweets 삭제
      const tweetDestroyResult = await Tweets.destroy({
        where: { tweet_id: req.body.tweet_id },
        transaction: transaction,
      });

      // Likes 삭제
      const likesDestroyResult = await Likes.destroy({
        where: { tweet_id: req.body.tweet_id },
        transaction: transaction,
      });

      // Comments 삭제
      const commentsDestroyResult = await Comments.destroy({
        where: { tweet_id: req.body.tweet_id },
        transaction: transaction,
      });

      // 모든 작업이 성공적으로 완료되면 트랜잭션 커밋
      await transaction.commit();

      // 응답 보내기
      res.status(201).json({
        tweetResult: tweetDestroyResult,
        likesResult: likesDestroyResult,
        commentsResult: commentsDestroyResult,
      });
    } catch (error: any) {
      // 오류 발생 시 트랜잭션 롤백
      // if (transaction) await transaction.rollback();

      // 에러 응답 보내기
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/like",
  verifyAccessToken,
  verifyRefreshToken,
  async (req: any, res: Response, next: NextFunction) => {
    await Likes.update(
      {
        user_id: req.body.data,
      },
      {
        where: { tweet_id: req.body.tweetId },
      }
    ).then((result: any) => {
      res.status(201).json(result);
    });
  }
);

module.exports = router;
