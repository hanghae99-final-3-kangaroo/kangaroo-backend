const jwt = require("jsonwebtoken");
const Listener = require("../src/Listener");
const MailSender = require("../src/MailSender");
const { authService } = require("../services");

const logIn = async (req, res, next) => {
  try {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRE,
    });
    const refresh_token = jwt.sign({}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE,
    });
    await authService.updateUserRefreshToken(refresh_token, user.user_id);
    res.status(200).send({ message: "success", token: token });
  } catch (err) {
    res.status(400).send({ message: err + " : login failed" });
  }
};

const googleCallback = async (req, res) => {
  const user = req.user;
  const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);
  res.status(200).send({
    message: "google login succeed",
    token: token,
  });
};

const kakaoCallback = async (req, res) => {
  const user = req.user;
  const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);
  res.status(200).send({
    message: "kakao login succeed",
    token: token,
  });
};

const facebookCallback = async (req, res) => {
  const user = req.user;
  const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);
  res.status(200).send({
    message: "facebook login succeed",
    token: token,
  });
};

const email = async (req, res) => {
  try {
    const { school_email } = req.body;
    const school_domain = school_email.split("@")[1];
    const isExist = await authService.findUnivByEmail(school_domain);
    if (!isExist) {
      res.status(403).send({ ok: false, message: "not supported university" });
      return;
    }

    const isExistUser = await authService.findUser({ school_email });
    if (isExistUser) {
      res.status(403).send({ ok: false, message: "already existing email" });
      return;
    }
    const authCode = Math.random().toString().substr(2, 6);
    const mailSender = new MailSender();
    const listener = new Listener(mailSender);
    listener.listen({
      targetEmail: school_email,
      type: "auth",
      authCode,
    });
    res.status(200).send({ authCode });
  } catch (err) {
    res.status(400).send({
      ok: false,
      message: err + " : email 전송 실패!",
    });
  }
};

const emailCheck = async (req, res) => {
  const { school_email, user_id } = req.body;
  const school_domain = school_email.split("@")[1];
  const isExist = await authService.findUnivByEmail(school_domain);
  if (isExist) {
    await authService.updateUserByUserId(
      {
        school_auth: true,
        school_email,
        univ_id: isExist.univ_id,
        country_id: isExist.country_id,
      },
      user_id
    );
    res.status(200).send({ result: "university authorized" });
    return;
  }
  res.status(403).send({ result: "not supported university" });
};

const findId = async (req, res) => {
  const { school_email } = req.body;
  const result = await authService.findUser({ school_email });
  if (result) {
    res.status(200).send({ result, ok: true });
    return;
  }
  res.status(403).send({ result: "no user", ok: false });
};

const findPw = async (req, res) => {
  try {
    const { email } = req.body;
    const isExist = await authService.findUser({ email });
    if (isExist) {
      const authCode = Math.random().toString().substr(2, 6);
      const mailSender = new MailSender();
      const listener = new Listener(mailSender);
      listener.listen({
        targetEmail: email,
        type: "find",
        authCode,
      });
      res.status(200).send({ authCode });
    } else {
      res.status(403).send({ result: "no user", ok: false });
    }
  } catch (error) {
    res.status(400).send({
      ok: false,
      message: error + "email 전송 실패!",
    });
  }
};
const updatePw = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.findUser({ email });
  if (result) {
    result.update({ password });
    res.status(200).send({ result, ok: true });
    return;
  }
  res.status(403).send({ result: "no user", ok: false });
};

module.exports = {
  logIn,
  googleCallback,
  kakaoCallback,
  facebookCallback,
  email,
  emailCheck,
  findId,
  findPw,
  updatePw,
};
