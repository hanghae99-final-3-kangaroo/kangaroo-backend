const jwt = require("jsonwebtoken");
const { user } = require("../models");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization==null || authorization == undefined || authorization == "null") {
    res.locals.user = null;
    next();
    return;
  }

  const [tokenType, tokenValue] = authorization.split(" ");

  try {
    const { user_id } = jwt.verify(tokenValue, "hanghaekangaroo");
    user.findOne({ where: user_id }).then((u) => {
      res.locals.user = u;
      next();
    });
  } catch (err) {
    res.send({ errorMessage: err + "로그인이 필요합니다." });
  }
};
