const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { user } = require("../models");
const bcrypt = require("bcrypt");

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
          const userCheck = await user.findOne({
            where: { email: email },
          });
          if (!userCheck) {
            return done(null, false, { message: "존재하지않는 아이디요" });
          }

          const authenticate = await bcrypt.compare(
            password,
            userCheck.password
          );
          if (authenticate === true) {
            return done(null, userCheck);
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
