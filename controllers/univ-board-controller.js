const { univBoardService } = require("../services");

const makePost = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;

    const { univ_id, title, category, content, is_fixed } = req.body;
    let { img_list } = req.body;

    if (img_list == undefined) img_list = [];

    const target = await univBoardService.createPost({
      user_id,
      univ_id,
      title,
      category,
      content,
      is_fixed,
      img_list: img_list.toString(),
    });

    const target_post_id = target.post_id;
    const result = await univBoardService.findOnePost(target_post_id);

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

    const result = await univBoardService.getLikesFromPosts(
      user_id,
      await univBoardService.findAllPost(pageSize, offset, category, univ_id)
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

    const page_count = await univBoardService.countPage(univ_id);

    const fixed_post = await univBoardService.findFixedPost();

    for (i = 0; i < fixed_post.length; i++) {
      img_list = fixed_post[i]["img_list"];
      if (img_list != null) {
        img_list = img_list.split(",");
      } else {
        img_list = [];
      }
      fixed_post[i].img_list = img_list;
    }

    res.status(200).send({
      fixed_post,
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

    const result = await univBoardService.getLikesFromPosts(
      user_id,
      await univBoardService.findAllPost(
        pageSize,
        offset,
        category,
        univ_id,
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

    await univBoardService.countViewPost(post_id);

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
    const result = await univBoardService.findOnePost(post_id);

    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "게시글이 없습니다.",
      });
      return;
    } else {
      let is_like = false;

      my_like = await univBoardService.findOneLike(user_id, post_id);

      if (my_like) {
        is_like = true;
      }

      all_like = await univBoardService.findAllLike(post_id);

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
};

const putPost = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const user_id = user.user_id;

    const { post_id } = req.params;
    const { univ_id, title, category, content, is_fixed, img_list } = req.body;

    const result = await univBoardService.findOnePost(post_id);

    if (user_id !== result.user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await univBoardService.updatePost(
      {
        univ_id,
        title,
        category,
        content,
        is_fixed,
        img_list: img_list.toString(),
      },
      post_id
    );

    const newResult = await univBoardService.findOnePost(post_id);

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

    const result = await univBoardService.findOnePost(post_id);

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

    await univBoardService.deletePost(post_id);

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
    const my_like = await univBoardService.findOneLike(user_id, post_id);

    if (my_like == null) {
      await univBoardService.createUnivLike(post_id, user_id);
      res.status(200).send({
        message: "liked post",
        ok: true,
      });
    } else {
      await univBoardService.deleteUnivLike(post_id, user_id);
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

    const check_post_id = await univBoardService.findOnePost(post_id);

    if (check_post_id == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 게시글 입니다.",
      });
    }

    const result = await univBoardService.createComment(
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

    const result = await univBoardService.findAllComment(post_id);

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
    const { user } = res.locals;
    const user_id = user.user_id;

    const { comment_id } = req.params;
    const { content } = req.body;

    const result = await univBoardService.findOneComent(comment_id);

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

    await univBoardService.updateComment(comment_id, content);

    const newComment = await univBoardService.findOneComent(comment_id);

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

    const check_comment_id = await univBoardService.findOneComent(comment_id);

    if (check_comment_id == null) {
      res.status(403).send({
        ok: false,
        message: "댓글이 없습니다",
      });
      return;
    }

    const { user_id: comment_user_id } = await univBoardService.findOneComent(
      comment_id
    );

    if (user_id != comment_user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await univBoardService.destroyComment(comment_id);

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
