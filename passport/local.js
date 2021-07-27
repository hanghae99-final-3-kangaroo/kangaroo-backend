const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
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
