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
const LocalStrategy = require("passport-local").Strategy;
router.post("/user", async (req, res) => {
  const { email, password, nickname } = req.body;
  try {
    const createdUser = await user.create({
      email,
      password,
      nickname,
    });
    res.status(200).send({
      ok: true,
      result: createdUser,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
});

router.get("/user/:user_id", checkLogin, async (req, res, next) => {
  console.log(req.user);
  const { user_id } = req.params;
  try {
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
      message: `${err}`,
    });
  }
});

router.put("/user/:user_id", checkLogin, async (req, res) => {
  const { user_id } = req.params;
  const { email, password, nickname } = req.body;
  try {
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
      message: `${err}`,
    });
  }
});

router.delete("/user/:user_id", checkLogin, async (req, res) => {
  const { user_id } = req.params;
  try {
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
      message: `${err}`,
    });
  }
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/fail" }),
  function (req, res) {
    res.redirect("/");
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
      passReqToCallback: false,
    },
    async function (email, password, done) {
      console.log(email, password);
      try {
        const result = await user.findOne({
          where: { email: email, password: password },
        });
        if (!result)
          return done(null, false, { message: "존재하지않는 아이디요" });
        if (email == result.password) {
          return done(null, result);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log("serializeUser ", user);
  done(null, user.user_id);
});

passport.deserializeUser(async function (id, done) {
  console.log("deserializeUser id ", id);
  let userinfo = await user.findOne({
    where: { user_id: id },
  });
  done(null, userinfo);
});

function checkLogin(req, res, next) {
  if (req.user) {
    console.log("login checked");
    next();
  } else {
    console.log("login first");
    res.send("로그인 안하셨는데요?");
  }
}

module.exports = router;
