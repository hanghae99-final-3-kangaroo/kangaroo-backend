const express = require("express");
const {
  user,
  university,
  country,
  vote,
  free_board,
  free_comment,
  univ_board,
  univ_comment,
} = require("../models");
const router = express.Router(); // 라우터라고 선언한다.
const authMiddleware = require("../middlewares/auth-middleware");
const bcrypt = require("bcrypt");
const Joi = require("joi");

const postUserModel = Joi.object({
  email: Joi.string().email().required(),
  nickname: Joi.string().min(4).max(20).required(),
  password: Joi.string()
    .alphanum()
    .pattern(new RegExp("^[a-zA-Z0-9]{4,30}$"))
    .required(),
});

router.post("/user", async (req, res) => {
  const { email, password, nickname } = await postUserModel.validateAsync(
    req.body
  );
  // console.log(email, password, nickname);
  const provider = "local";
  try {
    const dupEmail = await user.findOne({
      where: { email },
    });
    if (!password) {
      res.status(403).send({
        ok: false,
        message: "패스워드 미입력",
      });
      return;
    }
    if (dupEmail) {
      res.status(403).send({
        ok: false,
        message: "이메일 중복",
      });
      return;
    }
    const dupNick = await user.findOne({
      where: { nickname },
    });
    if (dupNick) {
      res.status(403).send({
        ok: false,
        message: "닉네임 중복",
      });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await user.create({
      email,
      password: hashedPassword,
      nickname,
      provider,
    });
    res.status(200).send({
      ok: true,
      result: createdUser,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 회원가입 실패`,
    });
  }
});

router.get("/user/:user_id", authMiddleware, async (req, res, next) => {
  const { user_id } = req.params;
  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }
    const myInfo = await user.findOne({
      where: { user_id },
      include: [
        { model: university, attributes: ["name"] },
        { model: country, attributes: ["name"] },
      ],
    });
    res.status(200).send({
      ok: true,
      result: myInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 유저 정보 조회 실패`,
    });
  }
});

router.put("/user/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;
  const { email, password, nickname } = req.body;
  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }
    await user.update(
      {
        email,
        password,
        nickname,
      },
      {
        where: { user_id },
      }
    );
    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 유저 정보 업데이트 실패`,
    });
  }
});

router.delete("/user/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;
  try {
    if (res.locals.user.user_id != user_id) {
      res.status(401).send({
        ok: false,
        message: "Unauthorized",
      });
      return;
    }
    await free_board.destroy({
      where: { user_id },
    });
    await free_comment.destroy({
      where: { user_id },
    });
    await univ_board.destroy({
      where: { user_id },
    });
    await univ_comment.destroy({
      where: { user_id },
    });
    await vote.destroy({
      where: { user_id },
    });
    await user.destroy({
      where: { user_id },
    });
    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 탈퇴 실패`,
    });
  }
});

router.post("/admin", authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  const { target_user_id } = req.body;

  try {
    const targetUniv = await university.findOne({
      where: { admin_id: user_id },
    });
    if (!targetUniv) {
      res.status(403).send({
        ok: false,
        message: "관리자 권한 없음",
      });
      return;
    }

    const targetUser = await user.findOne({
      where: { user_id: target_user_id },
    });
    if (targetUser.univ_id != targetUniv.univ_id) {
      res.status(403).send({
        ok: false,
        message: "변경을 원하는 관리자가 해당 대학에 재학중이지 않음",
      });
      return;
    }

    targetUniv.update({ admin_id: target_user_id });
    const resultUniv = await university.findOne({
      where: { univ_id: targetUniv.univ_id },
    });
    res.status(200).send({
      ok: true,
      result: resultUniv,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 관리자 변경 실패`,
    });
  }
});
module.exports = router;
