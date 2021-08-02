const jwt = require("jsonwebtoken");
const { user } = require("../models");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization == null) {
    res.status(401).send({
      errorMessage: "로그인이 필요합니다.",
    });
    return;
  }

  const [tokenType, tokenValue] = authorization.split(" ");

  if (tokenType !== "Bearer") {
    res.status(401).send({
      errorMessage: "로그인이 필요합니다.",
    });
    return;
  }

  try {
    const { user_id } = jwt.verify(tokenValue, "hanghaekangaroo");
    user.findOne({ where: user_id }).then((u) => {
      res.locals.user = u;
      next();
    });
  } catch (err) {
    res.send({ errorMessage: "로그인이 필요합니다." });
  }
};
