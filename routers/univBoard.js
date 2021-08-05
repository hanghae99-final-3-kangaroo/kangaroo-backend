const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");

const { univ_board } = require("../models");
const { univ_comment } = require("../models");
const { user } = require("../models");
const { Sequelize } = require("sequelize");

const router = express.Router(); // 라우터라고 선언한다.

// Post Part

// univ_board 글 작성
router.post("/post", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { univ_id, title, category, content, is_fixed } = req.body;

    const target = await univ_board.create({
      user_id,
      univ_id,
      title,
      category,
      content,
      is_fixed,
    });

    const target_post_id = target.post_id;
    const result = await univ_board.findOne({
      where: { post_id: target_post_id },
    });

    res.status(200).send({
      result,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 게시글 작성 실패`,
    });
  }
});

// univ_board 글 조회
router.get("/post", async (req, res, next) => {
  try {
    const { pageSize, pageNum, category, univ_id } = req.query;

    let offset = 0;

    if (pageNum > 1) {
      offset = pageSize * (pageNum - 1);
    }

    const options = {
      subQuery: false,
      limit: Number(pageSize),
      order: [["createdAt", "DESC"]],
      offset: offset,
      where: {},
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("comment_id")), "coment_count"],
        ],
      },
      include: [
        {
          model: univ_comment,
          attributes: [],
        },
      ],
      group: ["post_id"],
    };
    if (category !== undefined) options.where.category = category;
    if (univ_id !== undefined) options.where.univ_id = univ_id;

    const result = await univ_board.findAll(options);
    res.status(200).send({
      result,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 게시글 조회 실패`,
    });
  }
});

// univ_board 글 상세 조회
router.get("/post/:post_id", async (req, res, next) => {
  try {
    const { post_id } = req.params;

    const result = await univ_board.findOne({
      where: { post_id },
      include: [
        {
          model: user,
        },
      ],
    });

    if (result.length == 0) {
      res.status(403).send({
        ok: false,
        message: "게시글이 없습니다.",
      });
      return;
    }

    if (result != null) {
      res.status(200).send({
        result,
        ok: true,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 게시글 상세 조회 실패`,
    });
  }
});

// univ_board 글 수정
router.put("/post/:post_id", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id } = req.params;
    const { univ_id, title, category, content, is_fixed } = req.body;

    const { user_id: post_user_id } = await univ_board.findOne({
      where: { post_id },
      attributes: ["user_id"],
    });

    if (user_id !== post_user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await univ_board.update(
      {
        user_id,
        univ_id,
        title,
        category,
        content,
        is_fixed,
      },
      {
        where: { post_id },
      }
    );

    const result = await univ_board.findAll({
      where: { post_id },
    });

    res.status(200).send({
      result,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 게시글 수정 실패`,
    });
  }
});

// univ_board 글 삭제
router.delete("/post/:post_id", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id } = req.params;

    const { user_id: post_user_id } = await univ_board.findOne({
      where: { post_id },
      attributes: ["user_id"],
    });

    if (user_id !== post_user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await univ_board.destroy({
      where: { post_id },
    });
    await univ_comment.destroy({
      where: { post_id },
    });

    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 게시글 삭제 실패`,
    });
  }
});

// Comment Part

// univ_comment 작성
router.post("/comment", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id, content } = req.body;

    const check_post_id = await free_board.findOne({
      where: { post_id },
    });

    if (check_post_id == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 게시글 입니다.",
      });
    }

    const result = await univ_comment.create({
      user_id,
      post_id,
      content,
    });

    res.status(200).send({
      result,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 댓글 작성 실패`,
    });
  }
});

// univ_comment 조회
router.get("/comment/:post_id", async (req, res, next) => {
  try {
    const { post_id } = req.params;

    const result = await univ_comment.findAll({
      where: {
        post_id,
      },
      include: [
        {
          model: user,
        },
      ],
    });

    if (result.length == 0) {
      res.status(200).send({
        result,
        ok: true,
      });
      return;
    }

    res.status(200).send({
      result,
      ok: true,
      message: "댓글 조회 성공",
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 댓글 조회 실패`,
    });
  }
});

// univ_comment 수정
router.put("/comment/:comment_id", authMiddleware, async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { comment_id } = req.params;
    const { content } = req.body;

    const result = await univ_comment.findOne({
      where: { comment_id },
    });

    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "댓글이 없습니다",
      });
      return;
    }

    if (user_id != result.user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await result.update({ content });

    res.status(200).send({
      result,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 댓글 수정 실패`,
    });
  }
});

// univ_comment 삭제
router.delete(
  "/comment/:comment_id",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { user } = res.locals;
      const user_id = user.user_id;

      const { comment_id } = req.params;

      const check_comment_id = await univ_comment.findOne({
        where: { comment_id },
      });

      if (check_comment_id == null) {
        res.status(403).send({
          ok: false,
          message: "댓글이 없습니다",
        });
        return;
      }

      const { user_id: comment_user_id } = await univ_comment.findOne({
        where: { comment_id },
      });

      if (user_id != comment_user_id) {
        return res
          .status(401)
          .send({ ok: false, message: "작성자가 아닙니다" });
      }

      await univ_comment.destroy({
        where: {
          comment_id,
        },
      });

      res.status(200).send({
        ok: true,
      });
    } catch (err) {
      console.error(err);
      res.status(400).send({
        ok: false,
        message: `${err} : 게시글 삭제 실패`,
      });
    }
  }
);

module.exports = router;
