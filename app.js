const express = require("express"); // express를 쓴다
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const app = express();
const fs = require('fs');
const passportConfig = require("./passport");
const http=require("http");
const https=require("https");

dotenv.config();
app.set("port", process.env.PORT || 3000);

const cors = require("cors");
app.use(cors({ origin: true, credentials: true }));

const { sequelize } = require("./models");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스페이스오페라면");
  })
  .catch((error) => {
    console.error(error);
  });
passportConfig();
app.use(
  session({ secret: "secret key", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));
const userRouter = require("./routers/user");
const freeBoardRouter = require("./routers/freeBoard");
const univBoardRouter = require("./routers/univBoard");
const electionRouter = require("./routers/election");
const authRouter = require("./routers/auth");
const sampleRouter = require("./routers/sample");

app.use("/api", [userRouter]);
app.use("/auth", [authRouter]);
app.use("/free", [freeBoardRouter]);
app.use("/univ", [univBoardRouter]);
app.use("/election", [electionRouter]);
app.use("/test", [sampleRouter]);

app.get("/", (req, res) => {
  res.send("Hello, Kangaroo");
});

 const options = { // letsencrypt로 받은 인증서 경로를 입력
  ca: fs.readFileSync('/etc/letsencrypt/live/yzkim9501.site/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/yzkim9501.site/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yzkim9501.site/cert.pem')
  };
  http.createServer(app).listen(3000);
  https.createServer(options, app).listen(443);
