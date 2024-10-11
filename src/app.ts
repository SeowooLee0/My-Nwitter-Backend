import express, { Request, Response } from "express";
import sequelize from "../models/index";
import { Tweets } from "../models/tweets";
import bodyParser from "body-parser";
import cookiePaser from "cookie-parser";
import cors from "cors";
import { Users } from "../models/user";
import { SocketId } from "../models/socketId";
const { Op } = require("sequelize");
const app = express();
const server = require("http").createServer(app);
const port = 1234;
const SocketIO = require("socket.io");
const io = SocketIO(server, { cors: { origin: "*" } });
const redis = require("redis");

interface data {
  comment: string;
  tweetId: Number;
}

app.use(
  cors({
    origin: ["http://localhost:8080", "https://my-nwitter.vercel.app"],
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

  // 로그인했을때 소켓아이디 현재 접속자 데이터에 넣게
  socket.on("login", async (data: any) => {
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
    });

    // Redis에 userID와 socketID를 저장한다.
  });

  // 메세지 페이지 처음 로딩할때 체팅 데이터 가져오기
  socket.on("REQUEST_DATA", async (data: any) => {
    const findData = await redisCli.KEYS(`chat-*${data.id}*`);

    let respondData: any = [];
    await Promise.all(
      findData.map(async (t: any) => {
        let chatData = await redisCli.ZRANGE(`${t}`, 0, -1);

        if (chatData[0] === undefined) {
          return redisCli.DEL(t);
        } else {
          chatData.forEach((item: any) => {
            const parsedItem = JSON.parse(item);
            return respondData.push(parsedItem);
          });
        }
      })
    );

    io.to(socket.id).emit("RESPOND_DATA", respondData);
  });

  socket.on("START_CHAT", async (data: any) => {
    const roomId = `chat-${data.users.sort().join("-")}`;

    // Redis에서 해당 roomId의 존재 여부를 확인
    const chatExist = await redisCli.EXISTS(roomId);

    if (chatExist) {
      // 채팅방이 이미 존재하는 경우, 해당 채팅방의 메시지 데이터 불러오기
      const allData = await redisCli.ZRANGE(roomId, 0, -1);
      if (allData.length > 0) {
        io.to(socket.id).emit("BEFORE_DATA", roomId);
      }
    } else {
      // 채팅방이 존재하지 않는 경우, 새로운 채팅방 정보를 Redis에 저장
      console.log("Creating new chat room:", roomId);
      await redisCli.SET(`roomId:${roomId}`, JSON.stringify(data.users));
    }
  });

  socket.on("SEND_MESSAGE", async (m: any) => {
    console.log(`채팅 도착 ${m.message}`);

    let messageData = {
      send: `${m.send}`,
      receive: `${m.receive}`,
      message: `${m.message}`,
      date: `${m.date}`,
      roomId: `${m.roomId}`,
    };

    let change = JSON.stringify(messageData);

    let score = Number(m.score);
    await redisCli.ZADD(`${m.roomId}`, { score: score, value: change });

    // 메시지를 받는 사람에게 실시간으로 메시지 전송

    // 메시지를 받는 사람의 소켓 ID를 Redis에서 조회
    let getSocketId = await redisCli.GET(`${m.receive}`);

    // 조회한 소켓 ID로 메시지 전송
    if (getSocketId) {
      io.to(getSocketId).emit("RECEIVE_MESSAGE", change);
    } else {
      console.log("소켓 ID를 찾을 수 없습니다.");
    }

    // 선택된 roomId에 저장된 최신 메시지를 받아서 응답
    let chatData = await redisCli.ZRANGE(`${m.roomId}`, -1, -1);
    const latestMessage = JSON.parse(chatData[0]);
    console.log(m.receive);
    io.to(getSocketId).emit("RESPOND_DATA", latestMessage);
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

module.exports = app;
