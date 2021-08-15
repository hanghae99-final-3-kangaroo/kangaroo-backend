const express = require("express");
const router = express.Router(); // express 라우팅 기능을 사용하기 위해서 router 객체가 필요합니다.

const userRouter = require("./user");
const freeBoardRouter = require("./freeBoard");
const univBoardRouter = require("./univBoard");
const electionRouter = require("./election");
const authRouter = require("./auth-router");
const messageRouter = require("./message");
const utilRouter = require("./util");
const issueRouter = require("./issue");
const sampleRouter = require("./sample");

router.use("/api", [userRouter]);
router.use("/auth", [authRouter]);
router.use("/free", [freeBoardRouter]);
router.use("/univ", [univBoardRouter]);
router.use("/election", [electionRouter]);
router.use("/message", [messageRouter]);
router.use("/util", [utilRouter]);
router.use("/issue", [issueRouter]);
router.use("/test", [sampleRouter]);

module.exports = router; // 이렇게 내보낸 router 는 express app 의 미들웨어로 사용됩니다.
