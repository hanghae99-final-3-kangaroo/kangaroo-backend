const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const { user } = require("../models");

module.exports = () => {
  passport.use(
    "facebook",
    new FacebookStrategy(
      {
        clientID: "266510108573759",
        clientSecret: "5b40ef9bc7555d948e84d73c10f69892",
        callbackURL: "/auth/facebook/callback",
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
};
