const express = require("express");
const jwt = require("jsonwebtoken");
const {
  user,
  university,
  country,
  vote,
  free_board,
  free_comment,
  univ_board,
  univ_comment,
} = require("../models");
const router = express.Router(); // 라우터라고 선언한다.
const passport = require("passport");
const authMiddleware = require("../middlewares/auth-middleware");

router.post("/user", async (req, res) => {
  const { email, password, nickname } = req.body;
  const provider = "local";
  try {
    const dupEmail = await user.findOne({
      where: { email },
    });
    if (!password) {
      res.status(403).send({
        ok: false,
        message: "패스워드 미입력",
      });
      return;
    }
    if (dupEmail) {
      res.status(403).send({
        ok: false,
        message: "이메일 중복",
      });
      return;
    }
    const dupNick = await user.findOne({
      where: { nickname },
    });
    if (dupNick) {
      res.status(403).send({
        ok: false,
        message: "닉네임 중복",
      });
      return;
    }
    const createdUser = await user.create({
      email,
      password,
      nickname,
      provider,
    });
    res.status(200).send({
      ok: true,
      result: createdUser,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 회원가입 실패`,
    });
  }
});

router.get("/user/:user_id", authMiddleware, async (req, res, next) => {
  const { user_id } = req.params;
  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }
    const myInfo = await user.findOne({
      where: { user_id },
      include: [
        { model: university, attributes: ["name"] },
        { model: country, attributes: ["name"] },
      ],
    });
    res.status(200).send({
      ok: true,
      result: myInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 유저 정보 조회 실패`,
    });
  }
});

router.put("/user/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;
  const { email, password, nickname } = req.body;
  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }
    await user.update(
      {
        email,
        password,
        nickname,
      },
      {
        where: { user_id },
      }
    );
    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 유저 정보 업데이트 실패`,
    });
  }
});

router.delete("/user/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;
  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }
    await free_board.destroy({
      where: { user_id },
    });
    await free_comment.destroy({
      where: { user_id },
    });
    await univ_board.destroy({
      where: { user_id },
    });
    await univ_comment.destroy({
      where: { user_id },
    });
    await vote.destroy({
      where: { user_id },
    });
    await user.destroy({
      where: { user_id },
    });
    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 탈퇴 실패`,
    });
  }
});
router.get("/logout", async (req, res, next) => {
  req.logout();
  res.send({ message: "logout succeed" });
});
router.get("/fail", async (req, res, next) => {
  res.status(400).send({ message: "login failed" });
});
router.post(
  "/login",
  passport.authenticate("local", {
    session: false,
    failureRedirect: "/api/fail",
  }),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ userId: user.user_id }, "hanghaekangaroo");

    res.json({ message: "success", token: token, user: user.nickname });
  }
);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google"),
  function (req, res) {
    res.send({
      user_id: res.locals.user.user_id,
      message: "google login succeed",
    });
  }
);
router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao"),
  function (req, res) {
    res.send({
      user_id: res.locals.user.user_id,
      message: "kakao login succeed",
    });
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    authType: "rerequest",
    scope: ["public_profile", "email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook"),
  function (req, res) {
    res.send({
      user_id: res.locals.user.user_id,
      message: "facebook login succeed",
    });
  }
);
module.exports = router;
