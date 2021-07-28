const passport = require("passport");
const local = require("./local");
const { user } = require("../models");
module.exports = () => {
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
  //실행을 한번 시켜줘야 등록이 될 것이다.
  local();
};
