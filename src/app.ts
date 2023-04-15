import express, { Request, Response, NextFunction } from "express";
import sequelize from "../models/index";

import { Tweets } from "../models/tweets";
import bodyParser from "body-parser";
import cookiePaser from "cookie-parser";
import cors from "cors";
import path from "path";
import { Users } from "../models/user";
import { SocketId } from "../models/socketId";
import e from "express";
import { tsConstructSignatureDeclaration } from "@babel/types";
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { Op } = require("sequelize");

const app = express();
const server = require("http").createServer(app);
const port = 1234;
const SocketIO = require("socket.io");
const io = SocketIO(server, { cors: { origin: "*" } });
const router = express.Router();
const redis = require("redis");

interface data {
  comment: string;
  tweetId: Number;
}

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://hidden-howl-378706.du.r.appspot.com/",
      "*",
    ],

    credentials: true,
  })
);

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  legacyMode: true, // 반드시 설정 !!
});
redisClient.on("connect", () => {
  console.info("Redis connected!");
});
redisClient.on("error", (err: any) => {
  console.error("Redis Client Error", err);
});
redisClient.connect().then(); // redis v4 연결 (비동기)
const redisCli = redisClient.v4; // 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용

io.on("connection", (socket: any) => {
  //connection

  socket.on("disconnect", async () => {
    await redisCli.SREM("currentUser", `${socket.id}`).then(() => {
      clearInterval(socket.interval);
    });
    console.log("클라이언트 접속 해제");
  });

  //* 에러 시
  socket.on("error", (error: any) => {
    console.error(error);
  });

  // 메세지 페이지 처음 로딩할때 체팅 데이터 가져오기
  socket.on("REQUEST_DATA", async (data: any) => {
    const findData = await redisCli.KEYS(`roomId:*${data.id}*`);
    let respondData: any = [];
    await Promise.all(
      findData.map(async (t: any) => {
        console.log(t);
        let roomId = await redisCli.GET(`${t}`);
        let chatData = await redisCli.ZRANGE(`${roomId}`, -1, -1);

        console.log(chatData[0]);
        if (chatData[0] === undefined) {
          return redisCli.DEL(t);
        } else {
          const change = JSON.parse(chatData);
          return respondData.push(change);
        }
      })
    );
    console.log(respondData);
    io.to(socket.id).emit("RESPOND_DATA", respondData);
    // let roomId = await redisCli.MGET(...keys);
  });

  // 로그인했을때 소켓아이디 현재 접속자 데이터에 넣게
  socket.on("login", async (data: any) => {
    // 'client' room에 넣는다.

    await socket.join("client");

    await Users.findOne({
      where: {
        email: data.email,
      },
    }).then(async (r: any) => {
      const checkKey = await redisCli.EXISTS(`${r.user_id}`);
      if (checkKey) {
        await redisCli.GET(`$(r.user_id)`).then(() => {
          redisCli.DEL(`${r.user_id}`);
        });
      }
      await redisCli.SET(`${r.user_id}`, `${socket.id}`);

      await redisCli.SADD("currentUser", `${socket.id}`);

      const checkCurrent = await redisCli.SMEMBERS("currentUser");

      // console.log(socket.id, checkCurrent, checkKey);
    });

    // Redis에 userID와 socketID를 저장한다.
  });

  socket.on("START_CHAT", async (data: any) => {
    console.log(data);
    const chatExist = await redisCli.EXISTS(`roomId:${data.users}`);
    console.log(chatExist);
    if (chatExist == 1) {
      let roomId = await redisCli.GET(`roomId:${data.users}`);
      console.log(`${data.users}`);

      const allData = await redisCli.ZRANGE(`${roomId}`, 0, -1);

      if (allData === !null) console.log("발송");
      io.to(socket.id).emit("BEFORE_DATA", allData);
    } else {
      await redisCli.SET(`roomId:${data.users}`, `${data.roomId}`);
    }
  });

  socket.on("SEND_MESSAGE", async (m: any) => {
    const receiveUser = await redisCli.GET(`${m.receiveUser}`);
    // const currentUser = await redisCli.get(`${m.id}`);
    const checkUserExist = await redisCli.SISMEMBER(
      "currentUser",
      `${receiveUser}`
    );

    console.log(checkUserExist);
    let messageData = {
      send: `${m.id}`,
      receive: `${m.receiveUser}`,
      message: `${m.message}`,
      date: `${m.time}`,
    };

    let change = JSON.stringify(messageData);

    let score = Number(m.score);
    const nowDate = new Date();

    const findData = await redisCli.KEYS(`roomId:*${m.id}*`);
    let respondData: any = [];
    await Promise.all(
      findData.map(async (t: any) => {
        console.log(t);
        let roomId = await redisCli.GET(`${t}`);
        let chatData = await redisCli.ZRANGE(`${roomId}`, -1, -1);

        console.log(chatData[0]);
        if (chatData[0] === undefined) {
          return redisCli.DEL(t);
        } else {
          const change = JSON.parse(chatData);
          return respondData.push(change);
        }
      })
    );

    io.to(socket.id).emit("RESPOND_DATA", respondData);

    if (checkUserExist === 1) {
      let id = m.id;
      let message = m.message;
      let date = m.time;
      let roomId = await redisCli.GET(`roomId:${m.sortId}`);
      redisCli.ZADD(`${roomId}`, { score: score, value: change });
      const data = await redisCli.ZRANGE(`{roomId}`, 0, -1);
      console.log("접속하고있음");
      // redis에 채팅 데이터 저장하기

      io.to(receiveUser).emit("RECEIVE_MESSAGE", {
        id,
        message,
        date,
        data,
      });
      if (m.id !== m.receiveUser) {
        const findData = await redisCli.KEYS(`roomId:*${m.receiveUser}*`);
        let respondData: any = [];
        await Promise.all(
          findData.map(async (t: any) => {
            console.log(t);
            let roomId = await redisCli.GET(`${t}`);
            let chatData = await redisCli.ZRANGE(`${roomId}`, -1, -1);

            console.log(chatData[0]);
            if (chatData[0] === undefined) {
              return redisCli.DEL(t);
            } else {
              const change = JSON.parse(chatData);
              return respondData.push(change);
            }
          })
        );
      }

      io.to(socket.id).emit("RESPOND_DATA", respondData);

      // console.log("전송");
    } else {
      let roomId = await redisCli.GET(`roomId:${m.sortId}`);
      await redisCli.ZADD(`${roomId}`, {
        score: score,
        value: change,
      });
    }
  });

  socket.on("SEND_COMMENT", async (data: any) => {
    await Tweets.findOne({
      where: {
        tweet_id: data.tweetId,
      },
    }).then((r: any) => {
      SocketId.findOne({
        where: {
          user_id: r.user_id,
        },
      }).then((s: any) => {
        const clientsList = socket.adapter.rooms.get("client");

        try {
          socket.adapter.rooms.get("client").forEach((name: any) => {
            //break, 접속자가 많았을때 forEach?, redis 조회

            if (name === s.socket_id) {
              io.to(s.socket_id).emit("RECEIVE_COMMENT", name, s.socket_id);
              throw new Error("stop loop");
            }
          });
        } catch (e: any) {
          console.log("탈출");
        }

        // console.log(currnetClient);
      });
    });
    // 레디스에서 userID를 통해 socketID를 찾는다.
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookiePaser());
app.use("/static", express.static(__dirname + "/public"));
// console.log(__dirname + "/public/uploads");
// app.get(/^(?!.*_ah).*$/, (req, res, next) => {});

app.get(
  "/tag/:tagId",
  async (req: Request, res: Response): Promise<Response> => {
    const { tagId } = req.params;

    const selectTag: Tweets[] = await Tweets.findAll({
      where: {
        tag: { [Op.like]: [`%${tagId}%`] },
      },
    });

    return res.status(200).json({ data: selectTag });
  }
);

const getTweets = require("../routes/getTweets");
app.use("/getTweets", getTweets);

const getUsers = require("../routes/getUsers");
app.use("/getUsers", getUsers);

const getComments = require("../routes/getComments");
app.use("/getComments", getComments);

const newComments = require("../routes/getComments");
app.use("/getComments/newComments", newComments);

const saveTweets = require("../routes/saveTweets");
app.use("/saveTweets", saveTweets);

const saveComments = require("../routes/saveComments");
app.use("/saveComments", saveComments);

const saveLike = require("../routes/saveLike");
app.use("/saveLike", saveLike);

const saveBookmark = require("../routes/saveBookmark");
app.use("/saveBookmark", saveBookmark);

const register = require("../routes/register");
app.use("/register", register);

const login = require("../routes/login");
app.use("/login", login);

const refreshTokenRequest = require("../routes/refreshTokenRequest");
app.use("/refreshTokenRequest", refreshTokenRequest);

const logout = require("../routes/logout");
app.use("/logout", logout);

const upload = require("../routes/upload");
app.use("/upload", upload);

const saveFollow = require("../routes/saveFollow");
app.use("/saveFollow", saveFollow);

// app.use(function (error: any, req: any, res: { json: any }, next: any) {
//   // Any request to this server will get here, and will send an HTTP
//   // response with the error message 'woops'

//   res.json({ message: error.message });
// });

server.listen(port, async () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: 1234🛡️
  ################################################
`);

  await sequelize.development
    .sync()
    .then(() => {
      console.log("connection success");
    })
    .catch((e: any) => {
      console.log("error: ", e);
    });
});

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   res.locals.message = err.message;
//   res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
//   res.status(err.status || 500);
//   res.render("error");
// });

module.exports = app;
