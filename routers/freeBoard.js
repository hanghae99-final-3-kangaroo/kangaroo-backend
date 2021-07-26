const express = require("express");

const { free_board } = require("../models");
const { user } = require("../models");

const router = express.Router(); // 라우터라고 선언한다.

// free_board 글 작성
router.post("/post", async (req, res, next) => {
  try {
    // const { user_id } = req.user;

    // if (user_id !== null) {
    //   return res
    //     .status(401)
    //     .send({ ok: false, message: "로그인 먼저 해 주세요" });
    // }

    const { user_id, title, category, content, country_id } = req.body;

    const result = await free_board.create({
      user_id,
      title,
      category,
      content,
      country_id,
    });

    res.status(200).send({
      result,
      ok: true,
      message: "게시글 작성 성공",
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      ok: false,
      message: "게시글 작성 실패",
    });
  }
});

// free_board 글 조회
router.get("/post", async (req, res, next) => {
  try {
    const result = await free_board.findAll({});
    console.log(result);
    res.status(200).send({
      result,
      ok: true,
      message: "게시글 조회 성공",
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      ok: false,
      message: "게시글 조회 실패",
    });
  }
});

// free_board 글 상세 조회
router.get("/post/:post_id", async (req, res, next) => {
  try {
    const { post_id } = req.params;

    const result = await free_board.findOne({
      where: { post_id },
      include: [
        {
          model: user,
        },
      ],
    });

    if (result != null) {
      res.status(200).send({
        result,
        ok: true,
        message: "게시글 상세 조회 성공",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({
      ok: false,
      message: "게시글 상세 조회 실패",
    });
  }
});

// free_board 글 수정
router.put("/post/:post_id", async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const { user_id, title, category, content, country_id } = req.body;

    const { user_id: postUserId } = await free_board.findOne({
      where: { post_id },
      attributes: ["user_id"],
    });

    if (user_id !== postUserId) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await free_board.update(
      {
        user_id,
        title,
        category,
        content,
        country_id,
      },
      {
        where: { post_id },
      }
    );
    res.status(200).send({
      ok: true,
      message: "게시글 수정 성공",
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      ok: false,
      message: "게시글 수정 실패",
    });
  }
});

// free_board 글 삭제
router.delete("/post/:post_id", async (req, res, next) => {
  try {
    const { post_id } = req.params;
    // const { user_id } = req.user;
    const { user_id } = req.body;

    const { user_id: postUserId } = await free_board.findOne({
      where: { post_id },
      attributes: ["user_id"],
    });

    if (user_id !== postUserId) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await free_board.destroy({
      where: { post_id },
    });

    res.status(200).send({
      ok: true,
      message: "게시글 삭제 성공",
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      ok: false,
      message: "게시글 삭제 실패",
    });
  }
});

module.exports = router;
