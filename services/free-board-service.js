const {
  free_board,
  free_comment,
  user,
  free_like,
  issue,
} = require("../models");
const Sequelize = require("sequelize");
const { or, like } = Sequelize.Op;

const createPost = async (post) => {
  if (post["img_list"] == "") img_list = [];
  const result = await free_board.create(post);
};

const updatePost = async (post, post_id) => {
  await free_board.update(post, {
    where: { post_id },
  });
  const newPost = await free_board.findOne({ where: { post_id } });

  return newPost;
};

const deletePost = async (post_id) => {
  await issue.destroy({
    where: { post_id },
  });
  await free_board.destroy({
    where: { post_id },
  });
  await free_comment.destroy({
    where: { post_id },
  });
  await free_like.destroy({
    where: { post_id },
  });
};

const findOnePost = async (post_id) => {
  return await free_board.findOne({
    where: { post_id },
    include: [
      {
        model: user,
        attributes: ["user_id", "nickname"],
      },
    ],
  });
};

const findAllPost = async (
  pageSize,
  offset,
  category,
  country_id,
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
        [Sequelize.fn("COUNT", Sequelize.col("comment_id")), "comment_count"],
      ],
    },
    include: [
      {
        model: free_comment,
        attributes: [],
      },
    ],
    group: ["post_id"],
  };

  if (category !== undefined) options.where.category = category;
  if (country_id !== undefined) options.where.country_id = country_id;

  const searchWhereOption = {
    [or]: [
      { title: { [like]: `%${keyword}%` } },
      { content: { [like]: `%${keyword}%` } },
    ],
  };

  if (search == true) options.where = searchWhereOption;

  const posts = await free_board.findAndCountAll(options);
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
      my_like = await free_like.findOne({
        where: {
          user_id,
          post_id: posts["rows"][i].post_id,
        },
      });
      if (my_like) {
        is_like = true;
      }
    }
    all_like = await free_like.findAll({
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
    return await free_like.create({ post_id, user_id });
  } else {
    return await free_like.destroy({ where: { post_id, user_id } });
  }
};

const findLike = async (post_id, user_id) => {
  if (user_id == undefined) {
    return await free_like.findAll({ where: { post_id } });
  } else {
    return await free_like.findOne({
      where: {
        user_id,
        post_id,
      },
    });
  }
};

const createComment = async (user_id, post_id, content) => {
  return await free_comment.create({
    user_id,
    post_id,
    content,
  });
};

const updateComment = async (comment_id, content) => {
  await free_comment.update({ content }, { where: { comment_id } });
  const newComment = await free_comment.findOne({ where: { comment_id } });

  return newComment;
};

const destroyComment = async (comment_id) => {
  return await free_comment.destroy({
    where: {
      comment_id,
    },
  });
};

const findAllComment = async (post_id) => {
  return await free_comment.findAll({
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

const findOneComment = async (comment_id) => {
  return await free_comment.findOne({
    where: {
      comment_id,
    },
  });
};

const countPage = async (pageSize, category) => {
  const options = {
    subQuery: false,
    raw: true,
    where: {},
  };

  if (category != undefined) options.where.category = category;

  let page_count = await free_board.findAndCountAll(options);

  page_count = Math.ceil(page_count.count / pageSize);

  return page_count;
};

const countViewPost = async (post_id) => {
  return await free_board.increment({ view_count: +1 }, { where: { post_id } });
};

module.exports = {
  createPost,
  findOnePost,
  findAllPost,
  getLikesFromPosts,
  countPage,
  countViewPost,
  findLike,
  updatePost,
  deletePost,
  checkLike,
  createComment,
  findAllComment,
  findOneComment,
  updateComment,
  destroyComment,
};
