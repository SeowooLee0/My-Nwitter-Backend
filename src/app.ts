import express, { Request, Response, NextFunction } from "express";
import sequelize from "../models/index";
import { Tweets } from "../models/tweets";
import bodyParser from "body-parser";
import cookiePaser from "cookie-parser";
import cors from "cors";
import path from "path";
import { Users } from "../models/user";
import { SocketId } from "../models/socketId";
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const { Op } = require("sequelize");

const app = express();
const server = require("http").createServer(app);
const port = 1234;
const SocketIO = require("socket.io");
const io = SocketIO(server, { cors: { origin: "*" } });
interface data {
  comment: string;
  tweetId: Number;
}

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

io.on("connection", (socket: any) => {
  //connection
  console.log(socket.id);

  socket.on("disconnect", async () => {
    console.log("클라이언트 접속 해제", socket.id);
    // SocketId.destroy({
    //   where: {
    //     socket_id: socket.id,
    //   },
    // });
    clearInterval(socket.interval);
  });

  //* 에러 시
  socket.on("error", (error: any) => {
    console.error(error);
  });
  // socket.on("chat-message", (msg) => {
  //   console.log("message:", msg);
  // });
  socket.on("login", async (data: any) => {
    // 'client' room에 넣는다.
    await Users.findOne({
      where: {
        email: data.email,
      },
    }).then(async (r: any) => {
      await SocketId.destroy({
        where: {
          user_id: r.user_id,
        },
      });
      await SocketId.create({
        user_id: r.user_id,
        socket_id: socket.id,
      });
    });

    // Redis에 userID와 socketID를 저장한다.
  });

  socket.on("SEND_MESSAGE", async (data: any) => {
    await Tweets.findOne({
      where: {
        tweet_id: data.tweetId,
      },
    }).then((r: any) => {
      console.log(data);
      console.log(`소켓ID:${r.user_id}에게 소켓이벤트 SEND_MESSAGE 전송`);
      SocketId.findOne({
        where: {
          user_id: r.user_id,
        },
      }).then((s: any) => {
        io.to(s.socket_id).emit("RECEIVE_MESSAGE", data);
      });
    });
    // 레디스에서 userID를 통해 socketID를 찾는다.
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookiePaser());
app.use("/static", express.static(__dirname + "/public/uploads"));
// console.log(__dirname + "/public/uploads");
app.get("/", (req: Request, res: Response, next: NextFunction) => {});

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

const getSelectCurrentTweets = require("../routes/getTweets");
app.use("/getTweets/select", getSelectCurrentTweets);

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
