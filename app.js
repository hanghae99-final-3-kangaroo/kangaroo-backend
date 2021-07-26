const express = require("express"); // express를 쓴다
const dotenv = require("dotenv");

const app = express();

dotenv.config();

app.set("port", process.env.PORT || 3000);

const { sequelize } = require("./models");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공!");
  })
  .catch((error) => {
    console.error(error);
  });

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
