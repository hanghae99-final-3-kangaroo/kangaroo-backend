const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20");
const KakaoStrategy = require("passport-kakao").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { user } = require("../models");
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
        if (password == result.password) {
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
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "148319563207-70bqhlm2rk5dise6mvt7t26pe3tdiisb.apps.googleusercontent.com",
      clientSecret: "ADkGU_qzoB_ta7zMywof4Okf",
      callbackURL: "http://localhost:3000/api/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      const email = profile.emails[0].value;
      const nickname = profile.displayName;
      const provider = "google";
      let userInfo;
      userInfo = await user.findOne({ where: { provider, email } });
      if (!userInfo) {
        await user.create({
          provider,
          email,
          nickname,
        });
        userInfo = await user.findOne({ where: { provider, email } });
      }
      return done(null, userInfo);
    }
  )
);
passport.use(
  "kakao",
  new KakaoStrategy(
    {
      clientID: "4d6708ac100427bb2f8cca86b4352243",
      callbackURL: "/api/kakao/callback", // 위에서 설정한 Redirect URI
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile["_json"].kakao_account.email;
      const nickname = profile.displayName;
      const provider = "kakao";
      let userInfo;
      userInfo = await user.findOne({ where: { provider, email } });
      if (!userInfo) {
        await user.create({
          provider,
          email,
          nickname,
        });
        userInfo = await user.findOne({ where: { provider, email } });
      }
      return done(null, userInfo);
    }
  )
);
passport.use(
  "facebook",
  new FacebookStrategy(
    {
      clientID: "266510108573759",
      clientSecret: "5b40ef9bc7555d948e84d73c10f69892",
      callbackURL: "/api/facebook/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      // const email = profile["_json"].kakao_account.email;
      // const nickname = profile.displayName;
      //     const provider = "facebook";
      //     let userInfo;
      //     userInfo = await user.findOne({ where: { provider, email } });
      //     if (!userInfo) {
      //       await user.create({
      //         provider,
      //         email,
      //         nickname,
      //       });
      //       userInfo = await user.findOne({ where: { provider, email } });
      //     }
      //     return done(null, userInfo);
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log("serializeUser ", user);
  done(null, user.user_id);
});

passport.deserializeUser(async function (id, done) {
  console.log("deserializeUser id ", id);
  var userinfo = await user.findOne({
    where: { user_id: id },
  });
  done(null, userinfo);
});

module.exports = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).send({ ok: false, message: "로그인 안하셨는데요?" });
  }
};
