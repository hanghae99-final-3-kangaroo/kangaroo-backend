const { freeBoardService } = require("../services");

const makePost = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;

    const { title, category, content, country_id } = req.body;
    let { img_list } = req.body;

    if (img_list == undefined) img_list = [];

    const target = await freeBoardService.createPost({
      user_id,
      title,
      category,
      content,
      country_id,
      img_list: img_list.toString(),
    });

    const target_post_id = target.post_id;
    const result = await freeBoardService.findOnePost(target_post_id);
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
};

const getPost = async (req, res, next) => {
  try {
    const user_id = res.locals.user;
    const { pageSize, pageNum, category, country_id } = req.query;
    if (!pageSize || !pageNum) {
      res.status(403).send({
        message: "pageSize, pageNum을 입력하세요.",
        ok: false,
      });
      return;
    }

    let offset = 0;
    if (pageNum > 1) {
      offset = pageSize * (pageNum - 1);
    }

    const result = await freeBoardService.getLikesFromPosts(
      user_id,
      await freeBoardService.findAllPost(pageSize, offset, category, country_id)
    );

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

    const page_count = await freeBoardService.countPage();

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
};

const searchFreePost = async (req, res, next) => {
  try {
    const { pageSize, pageNum, category, country_id, sort } = req.query;
    if (!pageSize || !pageNum) {
      res.status(403).send({
        message: "pageSize, pageNum을 입력하세요.",
        ok: false,
      });
      return;
    }
    let { keyword } = req.query;
    const { user_id } = res.locals.user;

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

    const result = await freeBoardService.getLikesFromPosts(
      user_id,
      await freeBoardService.findAllPost(
        pageSize,
        offset,
        category,
        country_id,
        keyword,
        "search"
      ),
      sort,
      keyword
    );

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

    await freeBoardService.countViewPost(post_id);

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
    const is_user = res.locals.user;

    const result = await freeBoardService.findOnePost(post_id);

    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "게시글이 없습니다.",
      });
      return;
    } else {
      let is_like = false;

      if (is_user != null) {
        my_like = await freeBoardService.findOneLike(is_user.user_id, post_id);
        if (my_like) {
          is_like = true;
        }
      }

      all_like = await freeBoardService.findAllLike(post_id);

      if (result.img_list != null) {
        result.img_list = img_list = result["img_list"].split(",");
      } else {
        result.img_list = [];
      }

      res.status(200).send({
        result,
        like: {
          is_like,
          all_like: all_like.length,
        },
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
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id } = req.params;
    const { title, category, content, country_id, img_list } = req.body;

    const result = await freeBoardService.findOnePost(post_id);

    if (user_id !== result.user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await freeBoardService.updatePost(
      {
        title,
        category,
        content,
        country_id,
        img_list: img_list.toString(),
      },
      post_id
    );

    const newResult = await freeBoardService.findOnePost(post_id);

    newResult.img_list = img_list;

    res.status(200).send({
      result: newResult,
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
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id } = req.params;

    const result = await freeBoardService.findOnePost(post_id);

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

    await freeBoardService.deletePost(post_id);

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
    const my_like = await freeBoardService.findOneLike(post_id, user_id);

    if (my_like == null) {
      await freeBoardService.createFreeLike(post_id, user_id);
      res.status(200).send({
        message: "liked post",
        ok: true,
      });
    } else {
      await freeBoardService.deleteFreeLike(post_id, user_id);
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
};

const makeComment = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id, content } = req.body;

    const check_post_id = await freeBoardService.findOnePost(post_id);

    if (check_post_id == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 게시글 입니다.",
      });
      return;
    }

    const result = await freeBoardService.createComment(
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

    const result = await freeBoardService.findAllComment(post_id);

    if (result.length == 0) {
      res.status(200).send({
        result,
        ok: true,
        message: "댓글이 없습니다.",
      });
      return;
    }

    res.status(200).send({
      result,
      ok: true,
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
    const { user } = res.locals;
    const user_id = user.user_id;

    const { comment_id } = req.params;
    const { content } = req.body;

    const result = await freeBoardService.findOneComment(comment_id);

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

    await freeBoardService.updateComment(comment_id, content);

    const newComment = await freeBoardService.findOneComment(comment_id);

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
    const { user } = res.locals;
    const user_id = user.user_id;

    const { comment_id } = req.params;

    const check_comment_id = await freeBoardService.findOneComment(comment_id);

    if (check_comment_id == null) {
      res.status(403).send({
        ok: false,
        message: "댓글이 없습니다",
      });
      return;
    }

    const { user_id: comment_user_id } = await freeBoardService.findOneComment(
      comment_id
    );

    if (user_id != comment_user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await freeBoardService.destroyComment(comment_id);

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
  searchFreePost,
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
