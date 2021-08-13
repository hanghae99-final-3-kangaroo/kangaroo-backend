const express = require("express");

const { univ_board, univ_comment, user, univ_like } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const likeMiddleware = require("../middlewares/like-middleware");
const { Sequelize } = require("sequelize");
const router = express.Router(); // 라우터라고 선언한다.
const { or, like } = Sequelize.Op;

// Post Part

// univ_board 글 작성
router.post("/post", authMiddleware, async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;

    const { univ_id, title, category, content, is_fixed } = req.body;
    let { img_list } = req.body;

    if (img_list == undefined) img_list = [];

    const target = await univ_board.create({
      user_id,
      univ_id,
      title,
      category,
      content,
      is_fixed,
      img_list: img_list.toString(),
    });

    const target_post_id = target.post_id;
    const result = await univ_board.findOne({
      where: { post_id: target_post_id },
    });

    result.img_list = img_list;

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
router.get("/post", authMiddleware, async (req, res, next) => {
  try {
    const { user_id, univ_id } = res.locals.user;
    const { pageSize, pageNum, category } = req.query;
    if (!pageSize || !pageNum) {
      res.status(403).send({
        message: "pageSize, pageNum을 입력하세요.",
        ok: false,
      });
      return;
    }

    if (!univ_id) {
      res.status(403).send({
        message: "인증받은 대학이 없습니다.",
        ok: false,
      });
      return;
    }

    let offset = 0;
    if (pageNum > 1) {
      offset = pageSize * (pageNum - 1);
    }

    const options = {
      subQuery: false,
      raw: true,
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
    options.where.univ_id = univ_id;

    const result = await univ_board.findAll(options);
    for (let i = 0; i < result.length; i++) {
      let is_like = false;
      my_like = await univ_like.findOne({
        where: {
          user_id,
          post_id: result[i].post_id,
        },
      });
      if (my_like) {
        is_like = true;
      }
      all_like = await univ_like.findAll({
        where: { post_id: result[i].post_id },
      });
      result[i].like = {
        is_like,
        all_like: all_like.length,
      };
    }

    let img_list;
    for (i = 0; i < result.length; i++) {
      img_list = result[i]["img_list"];
      if (img_list != null) {
        img_list = img_list.split(",");
      } else {
        img_list = [];
      }
      result[i].img_list = img_list;
    }

    const page_count = await univ_board.findAll({
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("post_id")), "post_count"],
        ],
      },
      raw: true,
    });

    res.status(200).send({
      result,
      page_count: Math.ceil(page_count[0]["post_count"] / pageSize),
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

router.get("/search", likeMiddleware, async (req, res, next) => {
  try {
    const { univ_id, user_id } = res.locals.user;
    const { pageSize, pageNum, category, sort } = req.query;
    if (!pageSize || !pageNum) {
      res.status(403).send({
        message: "pageSize, pageNum을 입력하세요.",
        ok: false,
      });
      return;
    }
    let { keyword } = req.query;

    keyword = keyword.trim(); //trim으로 앞뒤 공백 제거
    if (!keyword.length) {
      //! 키워드에 공백만 존재
      return res.status(400).json("invalid target");
    }
    keyword = keyword.replace(/\s\s+/gi, " "); //target 사이에 공백이 2개 이상 존재 > 하나의 공백으로 변환

    let offset = 0;
    if (pageNum > 1) {
      offset = pageSize * (pageNum - 1);
    }

    const options = {
      subQuery: false,
      offset: offset,
      where: {
        [or]: [
          { title: { [like]: `%${keyword}%` } },
          { content: { [like]: `%${keyword}%` } },
        ],
      },
      limit: Number(pageSize),
      order: [["createdAt", "DESC"]],
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
      raw: true,
    };
    if (category !== undefined) options.where.category = category;
    options.where.univ_id = univ_id;
    const result = await univ_board.findAll(options);

    for (let i = 0; i < result.length; i++) {
      let is_like = false;
      my_like = await univ_like.findOne({
        where: {
          user_id,
          post_id: result[i].post_id,
        },
      });
      if (my_like) {
        is_like = true;
      }

      all_like = await univ_like.findAll({
        where: { post_id: result[i].post_id },
      });
      result[i].like = {
        is_like,
        all_like: all_like.length,
      };
    }
    if (sort == "relative") {
      for (let i = 0; i < result.length; i++) {
        let rel = 0;
        rel += result[i]["title"].split(keyword).length - 1;
        rel += result[i]["content"].split(keyword).length - 1;
        result[i]["rel"] = rel;
      }
      result.sort((a, b) => b.rel - a.rel); // rel의 값 순으로 내림차순 정렬.sort((a, b) => b.rel - a.rel); // rel의 값 순으로 내림차순 정렬
    }

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
router.get("/post/:post_id/view_count", async (req, res, next) => {
  try {
    const { post_id } = req.params;
    await univ_board.increment({ view_count: +1 }, { where: { post_id } });
    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 조회수 증가 실패`,
    });
  }
});

// univ_board 글 상세 조회
router.get("/post/:post_id", authMiddleware, async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const { user_id } = res.locals.user;
    const result = await univ_board.findOne({
      where: { post_id },
      include: [
        {
          model: user,
        },
      ],
    });

    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "게시글이 없습니다.",
      });
      return;
    } else {
      let is_like = false;
      my_like = await univ_like.findOne({
        where: {
          user_id,
          post_id,
        },
      });
      if (my_like) {
        is_like = true;
      }

      all_like = await univ_like.findAll({ where: { post_id } });

      if (result.img_list != null) {
        result.img_list = img_list = result["img_list"].split(",");
      } else {
        result.img_list = [];
      }

      res.status(200).send({
        like: {
          is_like,
          all_like: all_like.length,
        },
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
    const { univ_id, title, category, content, is_fixed, img_list } = req.body;

    const result = await univ_board.findOne({
      where: { post_id },
    });

    if (user_id !== result.user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await univ_board.update(
      {
        univ_id,
        title,
        category,
        content,
        is_fixed,
        img_list: img_list.toString(),
      },
      {
        where: { post_id },
      }
    );

    result.img_list = img_list;

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

    const result = await univ_board.findOne({
      where: { post_id },
    });

    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "없는 게시글 입니다.",
      });
      return;
    }

    if (user_id !== result.user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await univ_board.destroy({
      where: { post_id },
    });
    await univ_comment.destroy({
      where: { post_id },
    });
    await univ_like.destroy({
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
      message: `${err} : 게시글 삭제 실패`,
    });
  }
});

// univ_board 글 좋아요
router.get("/post/:post_id/like", authMiddleware, async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;
    const { post_id } = req.params;
    const my_like = await univ_like.findOne({
      where: { post_id, user_id },
    });

    if (my_like == null) {
      await univ_like.create({
        post_id,
        user_id,
      });
      res.status(200).send({
        message: "liked post",
        ok: true,
      });
    } else {
      await my_like.destroy();
      res.status(200).send({
        message: "disliked post",
        ok: true,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 좋아요/좋아요 취소 실패`,
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

    const check_post_id = await univ_board.findOne({
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

function getUserIP(req) {
  const addr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  return addr;
}
