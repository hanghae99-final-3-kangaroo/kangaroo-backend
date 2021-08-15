const express = require("express");
const router = express.Router(); // 라우터라고 선언한다.
const passport = require("passport");
const { authController } = require("../controllers");

router.get("/fail", async (req, res, next) => {
  res.status(400).send({ message: "login failed" });
});

router.post(
  "/login",
  passport.authenticate("local", {
    session: false,
    failureRedirect: "/auth/fail",
  }),
  authController.logIn
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
  authController.googleCallback
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
  authController.kakaoCallback
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
  authController.facebookCallback
);

router.post("/email", authController.email);
router.post("/email/check", authController.emailCheck);
router.post("/find-id", authController.findId);
router.post("/find-pw", authController.findPw);
router.post("/update-pw", authController.updatePw);

module.exports = router;
