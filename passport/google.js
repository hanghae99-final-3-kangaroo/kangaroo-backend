const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const { user } = require("../models");

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_PASSPORT_ID,
        clientSecret: process.env.GOOGLE_PASSPORT_PW,
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
