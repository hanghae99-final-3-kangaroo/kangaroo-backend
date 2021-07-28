const express = require("express"); // express를 쓴다
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const app = express();

const passportConfig = require("./passport");
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

const userRouter = require("./routers/user");
const freeBoardRouter = require("./routers/freeBoard");
const univBoardRouter = require("./routers/univBoard");
const electionRouter = require("./routers/election");
const sampleRouter = require("./routers/sample");

app.use("/api", [userRouter]);
app.use("/free", [freeBoardRouter]);
app.use("/univ", [univBoardRouter]);
app.use("/election", [electionRouter]);
app.use("/test", [sampleRouter]);

app.get("/", (req, res) => {
  res.send("Hello, Kangaroo");
});

app.listen(app.get("port"), () => {
  console.log(`listening at http://localhost:${app.get("port")}`);
});
