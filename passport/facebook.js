const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const { user } = require("../models");

module.exports = () => {
  passport.use(
    "facebook",
    new FacebookStrategy(
      {
        clientID: process.env.FB_PASSPORT_ID,
        clientSecret: process.env.FB_PASSPORT_PW,
        callbackURL: "/auth/facebook/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const nickname = profile.displayName;
        const provider = "facebook";
        const email = profile.id;
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
