const express = require("express");
const { user, message } = require("../models");
const router = express.Router(); // 라우터라고 선언한다.
const authMiddleware = require("../middlewares/auth-middleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const from_id = res.locals.user.user_id;
    const { to_id, content } = req.body;

    const createdMessage = await message.create({
      from_id,
      to_id,
      content,
      sentAt: new Date(),
      opened: false,
    });
    res.status(200).send({
      ok: true,
      result: createdMessage,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
});
router.get("/:message_id", authMiddleware, async (req, res) => {
  try {
    const user_id = res.locals.user.user_id;
    const { message_id } = req.params;
    const msg = await message.findOne({ where: { message_id } });
    res.status(200).send({
      ok: true,
      result: msg,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const to_id = res.locals.user.user_id;
    const messages = await message.findAll({
      where: { to_id },
      include: [
        {
          model: user,
          as: "messageFrom",
          attributes: ["user_id", "nickname", "email"],
        },
        {
          model: user,
          as: "messageTo",
          attributes: ["user_id", "nickname", "email"],
        },
      ],
    });
    res.status(200).send({
      ok: true,
      result: messages,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
});
module.exports = router;
