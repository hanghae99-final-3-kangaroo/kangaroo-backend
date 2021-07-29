const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const { user } = require("../models");

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID:
          "148319563207-70bqhlm2rk5dise6mvt7t26pe3tdiisb.apps.googleusercontent.com",
        clientSecret: "ADkGU_qzoB_ta7zMywof4Okf",
        callbackURL: "/auth/google/callback",
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
};
