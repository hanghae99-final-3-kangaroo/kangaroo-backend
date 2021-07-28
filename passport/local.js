const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { user } = require("../models");

module.exports = () => {
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
};
