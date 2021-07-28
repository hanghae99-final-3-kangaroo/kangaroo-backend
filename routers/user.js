const express = require("express");
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
const checkLogin = require("../passport/local");
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

router.get("/user/:user_id", checkLogin, async (req, res, next) => {
  req.user;
  const { user_id } = req.params;
  try {
    if (req.user.user_id != user_id) {
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

router.put("/user/:user_id", checkLogin, async (req, res) => {
  const { user_id } = req.params;
  const { email, password, nickname } = req.body;
  try {
    if (req.user.user_id != user_id) {
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

router.delete("/user/:user_id", checkLogin, async (req, res) => {
  const { user_id } = req.params;
  try {
    if (req.user.user_id != user_id) {
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
router.post("/login", (req, res, next) => {
  // POST /api/user/login
  passport.authenticate("local", (err, user, info) => {
    // (err, user, info) 는 passport의 done(err, data, logicErr) 세 가지 인자
    if (err) {
      // 서버에 에러가 있는 경우
      console.error(err);
      next(err);
    }
    if (info) {
      // 로직 상 에러가 있는 경우
      return res.status(401).send(info.reason);
    }
    return req.login(user, (loginErr) => {
      // req.login() 요청으로 passport.serializeUser() 실행
      if (loginErr) {
        return next(loginErr);
      }
      const filteredUser = Object.assign({}, user.toJSON());
      // user 객체는 sequelize 객체이기 때문에 순수한 JSON으로 만들기 위해 user.toJSON()
      // user.toJSON() 하지 않으면 에러 발생
      // toJSON()을 붙여주는 이유는 서버로부터 전달받은 데이터를 변형하기 때문임.
      delete filteredUser.password; // 서버로부터 전달받은 데이터를 변형하지 않는다면
      return res.json(filteredUser); // toJSON()을 붙이지 않고 바로 응답하여도 무방
    });
  })(req, res, next);
  // 미들웨어(router) 내의 미들웨어(passport)에는 (req, res, next)를 붙입니다.
});
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
    res.send({ user_id: req.user.user_id, message: "google login succeed" });
  }
);
router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao"),
  function (req, res) {
    res.send({ user_id: req.user.user_id, message: "kakao login succeed" });
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
    res.send({ user_id: req.user.user_id, message: "facebook login succeed" });
  }
);
module.exports = router;
