const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router(); // 라우터라고 선언한다.
const passport = require("passport");
const ejs = require("ejs");
const path = require("path");
const appDir = path.dirname(require.main.filename);
const nodemailer = require("nodemailer");
const { university, user } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

router.get("/logout", async (req, res, next) => {
  req.logout();
  res.send({ message: "logout succeed" });
});
router.get("/fail", async (req, res, next) => {
  res.status(400).send({ message: "login failed" });
});
router.post(
  "/login",
  passport.authenticate("local", {
    session: false,
    failureRedirect: "/auth/fail",
  }),
  async function (req, res) {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, "hanghaekangaroo", {
      expiresIn: "20s",
    });
    const refresh_token = jwt.sign({}, "hanghaekangaroo", {
      expiresIn: "14d",
    });
    await user.update({ refresh_token }, { where: { user_id: user.user_id } });
    res.status(200).send({ message: "success", token: token });
  }
);
router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/fail",
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google"),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, "hanghaekangaroo");
    res.status(200).send({
      message: "google login succeed",
      token: token,
    });
  }
);
router.get(
  "/kakao",
  passport.authenticate("kakao", {
    session: false,
    failureRedirect: "/auth/fail",
  })
);

router.get(
  "/kakao/callback",
  passport.authenticate("kakao"),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, "hanghaekangaroo");
    res.status(200).send({
      message: "kakao login succeed",
      token: token,
    });
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    authType: "rerequest",
    scope: ["public_profile", "email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "/auth/fail",
  }),
  function (req, res) {
    const user = req.user;
    const token = jwt.sign({ user_id: user.user_id }, "hanghaekangaroo");
    res.status(200).send({
      message: "facebook login succeed",
      token: token,
    });
  }
);

router.post("/email", async (req, res) => {
  try {
    const { school_email } = req.body;
    const school_domain = school_email.split("@")[1];
    const isExist = await university.findOne({
      where: {
        email_domain: {
          [Op.like]: "%" + school_domain,
        },
      },
    });
    if (!isExist) {
      res.status(403).send({ ok: false, message: "not supported university" });
      return;
    }

    const isExistUser = await user.findOne({
      where: {
        school_email,
      },
    });
    if (isExistUser) {
      res.status(403).send({ ok: false, message: "already existing email" });
      return;
    }
    let authCode = Math.random().toString().substr(2, 6);
    let emailTemplete;
    ejs.renderFile(
      appDir + "/template/authmail.ejs",
      { authCode },
      function (err, data) {
        if (err) {
          console.log(err);
        }
        emailTemplete = data;
      }
    );

    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    let mailOptions = await transporter.sendMail({
      from: `UFO`,
      to: school_email,
      subject: "회원가입을 위한 인증번호를 입력해주세요.",
      html: emailTemplete,
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
      console.log("Finish sending email : " + info.response);
      res.send({ authCode });
      transporter.close();
    });
  } catch (errer) {
    res.status(400).send({
      ok: false,
      message: "email 전송 실패!",
    });
  }
});

router.post("/email/check", async (req, res) => {
  const { school_email, user_id } = req.body;
  const school_domain = school_email.split("@")[1];
  const isExist = await university.findOne({
    where: {
      email_domain: {
        [Op.like]: "%" + school_domain,
      },
    },
  });
  if (isExist) {
    await user.update(
      {
        school_auth: true,
        school_email,
        univ_id: isExist.univ_id,
        country_id: isExist.country_id,
      },
      {
        where: { user_id },
      }
    );

    res.status(200).send({ result: "university authorized" });
    return;
  }
  res.status(403).send({ result: "not supported university" });
});

router.post("/find-id", async (req, res) => {
  const { school_email } = req.body;
  const result = await user.findOne({
    where: { school_email },
  });
  if (result) {
    res.status(200).send({ result, ok: true });
    return;
  }
  res.status(403).send({ result: "no user", ok: false });
});

router.post("/find-pw", async (req, res) => {
  try {
    const { email } = req.body;
    const isExist = await user.findOne({
      where: { email },
    });
    if (isExist) {
      let authCode = Math.random().toString().substr(2, 6);
      let emailTemplete;
      ejs.renderFile(
        appDir + "/template/findpwmail.ejs",
        { authCode },
        function (err, data) {
          if (err) {
            console.log(err);
          }
          emailTemplete = data;
        }
      );

      let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      });

      let mailOptions = await transporter.sendMail({
        from: `UFO`,
        to: email,
        subject: "비밀번호 재설정을 위한 인증번호를 입력해주세요.",
        html: emailTemplete,
      });

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        }
        console.log("Finish sending email : " + info.response);
        res.send({ authCode });
        transporter.close();
      });
    } else {
      res.status(403).send({ result: "no user", ok: false });
    }
  } catch (error) {
    res.status(400).send({
      ok: false,
      message: error + "email 전송 실패!",
    });
  }
});

router.post("/update-pw", async (req, res) => {
  const { email, password } = req.body;
  const result = await user.findOne({
    where: { email },
  });
  if (result) {
    result.update({ password });
    res.status(200).send({ result, ok: true });
    return;
  }
  res.status(403).send({ result: "no user", ok: false });
});

module.exports = router;
