const { boardService, userService } = require("../services");

const fs = require("fs");
const path = require("path");
const appDir = path.dirname(require.main.filename);

const makePost = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;

    const { univ_id, title, category, content, img_list, is_fixed } = req.body;

    const checkAdmin = await userService.findUniv({
      admin_id: user_id,
    });

    if (is_fixed == true) {
      if (checkAdmin == null) {
        res.status(401).send({
          ok: false,
          message: `당신에게는 권한이 없습니다.`,
        });
        return;
      } else if (checkAdmin["univ_id"] != univ_id) {
        res.status(401).send({
          ok: false,
          message: "당신은 이 대학의 관리자가 아닙니다.",
        });
        return;
      }
    }

    const result = await boardService.createPost("univ", {
      user_id,
      univ_id,
      title,
      category,
      content,
      img_list,
      is_fixed,
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
};

const getPost = async (req, res, next) => {
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

    const result = await boardService.getLikesFromPosts(
      "univ",
      user_id,
      await boardService.findAllPost(
        "univ",
        pageSize,
        offset,
        category,
        null, // keyword
        null, // search
        null, // country_id
        univ_id
      ),
      null, // sort
      null // keyword
    );

    const fixed_post = await boardService.getLikesFromPosts(
      "univ",
      user_id,
      await boardService.findFixedPost(),
      null, // sort
      null // keyword
    );

    res.status(200).send({
      fixed_post,
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
};

const searchUnivPost = async (req, res, next) => {
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

    const result = await boardService.getLikesFromPosts(
      "univ",
      user_id,
      await boardService.findAllPost(
        "univ",
        pageSize,
        offset,
        category,
        keyword,
        true, // search
        null, // country_id
        univ_id
      ),
      sort,
      keyword
    );

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
};

const getCountViewPost = async (req, res, next) => {
  try {
    const { post_id } = req.params;

    await boardService.countViewPost("univ", post_id);

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
};

const getOnePost = async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const { user_id } = res.locals.user;

    const result = await boardService.findOnePost("univ", post_id);

    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "게시글이 없습니다.",
      });
      return;
    } else {
      let is_like = false;

      if (user_id != null) {
        my_like = await boardService.findLike("univ", post_id, user_id);
        if (my_like) {
          is_like = true;
        }
      }

      all_like = await boardService.findLike("univ", post_id);

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
};

const putPost = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;
    const { post_id } = req.params;
    const { univ_id, title, category, content, img_list, is_fixed } = req.body;

    const result = await boardService.findOnePost("univ", post_id);

    if (user_id !== result.user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    if (img_list != undefined && result["img_list"].length === 0) {
      findDeleteImg = result["img_list"].filter((x) => !img_list.includes(x));

      for (let i = 0; i < findDeleteImg.length; i++) {
        fs.unlinkSync(appDir + "/public/" + findDeleteImg[i]);
      }
    }

    const newPost = await boardService.updatePost(
      "univ",
      {
        univ_id,
        title,
        category,
        content,
        is_fixed,
        img_list,
      },
      post_id
    );

    res.status(200).send({
      result: newPost,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 게시글 수정 실패`,
    });
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;

    const { post_id } = req.params;

    const result = await boardService.findOnePost("univ", post_id);

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

    if (result["img_list"] && result["img_list"] != "") {
      for (let i = 0; i < result["img_list"].length; i++) {
        fs.unlinkSync(appDir + "/public/" + result["img_list"][i]);
      }
    }

    await boardService.deletePost("univ", post_id);

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
};

const likePost = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;
    const { post_id } = req.params;

    const my_like = await boardService.findLike("univ", post_id, user_id);

    const message = await boardService.checkLike(
      "univ",
      my_like,
      post_id,
      user_id
    );

    res.status(200).send({
      message,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 좋아요/좋아요 취소 실패`,
    });
  }
};

const makeComment = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;
    const { post_id, content } = req.body;

    const check_post_id = await boardService.findOnePost("univ", post_id);

    if (check_post_id == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 게시글 입니다.",
      });
    }

    const result = await boardService.createComment(
      "univ",
      user_id,
      post_id,
      content
    );

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
};

const getComment = async (req, res, next) => {
  try {
    const { post_id } = req.params;

    const result = await boardService.findAllComment("univ", post_id);

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
};

const putComment = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;
    const { comment_id } = req.params;
    const { content } = req.body;

    const result = await boardService.findOneComment("univ", comment_id);

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

    const newComment = await boardService.updateComment(
      "univ",
      comment_id,
      content
    );

    res.status(200).send({
      result: newComment,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 댓글 수정 실패`,
    });
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;
    const { comment_id } = req.params;

    const result = await boardService.findOneComment("univ", comment_id);

    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "댓글이 없습니다",
      });
      return;
    }

    if (user_id != result["user_id"]) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await boardService.destroyComment("univ", comment_id);

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
};

module.exports = {
  makePost,
  getPost,
  searchUnivPost,
  getCountViewPost,
  getOnePost,
  putPost,
  deletePost,
  likePost,
  makeComment,
  getComment,
  putComment,
  deleteComment,
};
