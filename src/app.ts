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

const corsOptions = {
  origin: ["http://localhost:8080", "https://my-nwitter.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 허용할 메서드
  allowedHeaders: ["Authorization", "Content-Type"], // 허용할 헤더
};

app.use(cors(corsOptions));

// 명시적으로 프리플라이트 OPTIONS 요청 처리
app.options("*", cors(corsOptions));

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
