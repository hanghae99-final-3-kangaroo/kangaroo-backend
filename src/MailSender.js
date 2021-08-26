const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const appDir = path.dirname(require.main.filename);
class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
  }

  sendEmail(targetEmail, type, authCode) {
    let message;
    let emailTemplete;
    if (type == "auth") {
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
      message = {
        from: `UFO`,
        to: targetEmail,
        subject: "회원가입을 위한 인증번호를 입력해주세요.",
        html: emailTemplete,
      };
    } else if (type == "find") {
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
      message = {
        from: `UFO`,
        to: targetEmail,
        subject: "비밀번호 재설정을 위한 인증번호를 입력해주세요.",
        html: emailTemplete,
      };
    } else if (type == "welcome") {
      ejs.renderFile(
        appDir + "/template/welcome.ejs",
        { authCode },
        function (err, data) {
          if (err) {
            console.log(err);
          }
          emailTemplete = data;
        }
      );
      message = {
        from: `UFO`,
        to: targetEmail,
        subject: '"UFO - 유학생의 프리한 오늘"에 가입하신것을 환영합니다!',
        html: emailTemplete,
      };
    }

    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
