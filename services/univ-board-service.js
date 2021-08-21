const { univ_board, univ_comment, user, univ_like } = require("../models");
const Sequelize = require("sequelize");
const { or, like } = Sequelize.Op;

const createPost = async (post) => {
  return await univ_board.create(post);
};

const updatePost = async (post, post_id) => {
  await univ_board.update(post, {
    where: { post_id },
  });
  const newPost = await univ_board.findOne({ where: { post_id } });

  return newPost;
};

const deletePost = async (post_id) => {
  await univ_board.destroy({
    where: { post_id },
  });
  await univ_comment.destroy({
    where: { post_id },
  });
  await univ_like.destroy({
    where: { post_id },
  });
};

const findOnePost = async (post_id) => {
  return await univ_board.findOne({
    where: { post_id },
    include: [
      {
        model: user,
      },
    ],
  });
};

const findAllPost = async (
  pageSize,
  offset,
  category,
  univ_id,
  keyword,
  search
) => {
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

  const searchWhereOption = {
    [or]: [
      { title: { [like]: `%${keyword}%` } },
      { content: { [like]: `%${keyword}%` } },
    ],
  };

  if (search == true) options.where = searchWhereOption;

  const posts = await univ_board.findAndCountAll(options);
  posts["count"] = posts["count"].length;

  let img_list;
  for (i = 0; i < posts["rows"].length; i++) {
    img_list = posts["rows"][i]["img_list"];
    if (img_list != null) {
      img_list = img_list.split(",");
    } else {
      img_list = [];
    }
    posts["rows"][i].img_list = img_list;
  }

  return posts;
};

const getLikesFromPosts = async (user_id, posts, sort, keyword) => {
  for (let i = 0; i < posts["rows"].length; i++) {
    let is_like = false;
    if (user_id != null) {
      my_like = await univ_like.findOne({
        where: {
          user_id,
          post_id: posts["rows"][i].post_id,
        },
      });
      if (my_like) {
        is_like = true;
      }
    }
    all_like = await univ_like.findAll({
      where: { post_id: posts["rows"][i].post_id },
    });
    posts["rows"][i].like = {
      is_like,
      all_like: all_like.length,
    };
  }

  if (sort == "relative") {
    for (let i = 0; i < posts["rows"].length; i++) {
      let rel = 0;
      rel += posts["rows"][i]["title"].split(keyword).length - 1;
      rel += posts["rows"][i]["content"].split(keyword).length - 1;
      posts["rows"][i]["rel"] = rel;
    }
    posts["rows"].sort((a, b) => b.rel - a.rel); // rel의 값 순으로 내림차순 정렬.sort((a, b) => b.rel - a.rel); // rel의 값 순으로 내림차순 정렬
  }

  return posts;
};

const checkLike = async (my_like, post_id, user_id) => {
  if (my_like == null) {
    return await univ_like.create({ post_id, user_id });
  } else {
    return await univ_like.destroy({ where: { post_id, user_id } });
  }
};

const findLike = async (post_id, user_id) => {
  if (user_id == undefined) {
    return await univ_like.findAll({ where: { post_id } });
  } else {
    return await univ_like.findOne({
      where: {
        user_id,
        post_id,
      },
    });
  }
};

const createComment = async (user_id, post_id, content) => {
  return await univ_comment.create({ user_id, post_id, content });
};

const updateComment = async (comment_id, content) => {
  await univ_comment.update(
    { content },
    {
      where: { comment_id },
    }
  );
  const newComment = await univ_comment.findOne({ where: { comment_id } });

  return newComment;
};

const destroyComment = async (comment_id) => {
  return await univ_comment.destroy({
    where: {
      comment_id,
    },
  });
};

const findAllComment = async (post_id) => {
  return await univ_comment.findAll({
    where: {
      post_id,
    },
    include: [
      {
        model: user,
      },
    ],
  });
};

const findOneComent = async (comment_id) => {
  return await univ_comment.findOne({
    where: { comment_id },
  });
};

const countPage = async (pageSize, category, univ_id) => {
  const options = {
    subQuery: false,
    raw: true,
    where: { univ_id },
  };

  if (category != undefined) options.where.category = category;

  let page_count = await univ_board.findAndCountAll(options);

  page_count = Math.ceil(page_count.count / pageSize);

  return page_count;
};

const countViewPost = async (post_id) => {
  return await univ_board.increment({ view_count: +1 }, { where: { post_id } });
};

const findFixedPost = async () => {
  const posts = await univ_board.findAndCountAll({
    subQuery: false,
    raw: true,
    where: { is_fixed: true },
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
  });
  posts["count"] = posts["count"].length;

  let img_list;
  for (i = 0; i < posts["rows"].length; i++) {
    img_list = posts["rows"][i]["img_list"];
    if (img_list != null) {
      img_list = img_list.split(",");
    } else {
      img_list = [];
    }
    posts["rows"][i].img_list = img_list;
  }

  return posts;
};

module.exports = {
  createPost,
  findOnePost,
  findAllPost,
  getLikesFromPosts,
  countPage,
  findFixedPost,
  countViewPost,
  findLike,
  updatePost,
  deletePost,
  checkLike,
  createComment,
  findAllComment,
  findOneComent,
  updateComment,
  destroyComment,
};
