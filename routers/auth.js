const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router(); // 라우터라고 선언한다.
const passport = require("passport");

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
    failureRedirect: "/auth/fail",
  }),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, "hanghaekangaroo");

    res.json({ message: "success", token: token });
  }
);
router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/fail",
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google"),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, "hanghaekangaroo");
    res.json({
      message: "google login succeed",
      token: token,
    });
  }
);
router.get(
  "/kakao",
  passport.authenticate("kakao", {
    session: false,
    failureRedirect: "/auth/fail",
  })
);

router.get(
  "/kakao/callback",
  passport.authenticate("kakao"),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, "hanghaekangaroo");
    res.json({
      message: "kakao login succeed",
      token: token,
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
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "/auth/fail",
  }),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, "hanghaekangaroo");
    res.json({
      message: "facebook login succeed",
      token: token,
    });
  }
);
module.exports = router;
