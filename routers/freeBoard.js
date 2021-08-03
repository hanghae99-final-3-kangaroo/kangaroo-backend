const express = require("express");

const { free_board } = require("../models");
const { free_comment } = require("../models");
const { user } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router(); // 라우터라고 선언한다.

// Post Part

// free_board 글 작성
router.post("/post", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { title, category, content, country_id } = req.body;

    const target = await free_board.create({
      user_id,
      title,
      category,
      content,
      country_id,
    });

    const targetPostId = target.post_id;
    const result = await free_board.findOne({
      where: { post_id: targetPostId },
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

    const check = await free_board.findAll({
      where: { post_id },
    });

    if (check.length == 0) {
      res.status(400).send({
        ok: false,
        message: "게시글이 없습니다.",
      });
      return;
    }

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
router.put("/post/:post_id", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals; // authMiddleware
    const user_id = user.user_id;

    const { post_id } = req.params;
    const { title, category, content, country_id } = req.body;

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
    const result = await free_board.findAll({
      where: { post_id },
    });

    res.status(200).send({
      result,
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
router.delete("/post/:post_id", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id } = req.params;

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
    await free_comment.destroy({
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

// Comment Part

// free_comment 작성
router.post("/comment", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id, content } = req.body;

    const result = await free_comment.create({
      user_id,
      post_id,
      content,
    });

    res.status(200).send({
      result,
      ok: true,
      message: "댓글 작성 성공",
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      ok: false,
      message: "댓글 작성 실패",
    });
  }
});

// free_comment 조회
router.get("/comment/:post_id", async (req, res, next) => {
  try {
    const { post_id } = req.params;

    const check = await free_comment.findAll({
      where: { post_id },
    });

    if (check.length == 0) {
      res.status(400).send({
        ok: false,
        message: "댓글이 없습니다.",
      });
      return;
    }

    const result = await free_comment.findAll({
      where: {
        post_id,
      },
      include: [
        {
          model: user,
        },
      ],
    });
    res.status(200).send({
      result,
      ok: true,
      message: "댓글 조회 성공",
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      ok: false,
      message: "댓글 조회 실패",
    });
  }
});

// free_comment 수정
router.put("/comment/:comment_id", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { comment_id } = req.params;
    const { content } = req.body;

    const { user_id: commentUserId } = await free_comment.findOne({
      where: { comment_id },
    });

    if (user_id != commentUserId) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await free_comment.update({ content }, { where: { comment_id } });

    const result = await free_comment.findOne({
      where: { comment_id },
    });
    res.status(200).send({
      result,
      ok: true,
      message: "댓글 수정 성공",
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      ok: false,
      message: "댓글 수정 실패",
    });
  }
});

// free_comment 삭제
router.delete(
  "/comment/:comment_id",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { user } = res.locals;
      const user_id = user.user_id;

      const { comment_id } = req.params;

      const { user_id: commentUserId } = await free_comment.findOne({
        where: { comment_id },
      });

      if (user_id != commentUserId) {
        return res
          .status(401)
          .send({ ok: false, message: "작성자가 아닙니다" });
      }

      await free_comment.destroy({
        where: {
          comment_id,
        },
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
  }
);

module.exports = router;
