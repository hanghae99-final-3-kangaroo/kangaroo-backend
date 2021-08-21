const {
  user,
  university,
  country,
  vote,
  free_board,
  free_comment,
  free_like,
  univ_board,
  univ_comment,
  univ_like,
} = require("../models");
const Sequelize = require("sequelize");

const findUser = async (field) => {
  return await user.findOne({
    where: field,
    include: [
      { model: university, attributes: ["name"] },
      { model: country, attributes: ["name"] },
    ],
  });
};

const createUser = async (fields) => {
  return await user.create(fields);
};

const findPosts = async (
  model,
  additionalOptions,
  pageSize,
  offset,
  ifComment
) => {
  const options = {
    subQuery: false,
    raw: true,
    limit: Number(pageSize),
    order: [["createdAt", "DESC"]],
    offset: offset,
    where: {},
    attributes: [
      "post_id",
      "user_id",
      "title",
      "content",
      "category",
      "view_count",
      "createdAt",
      [Sequelize.fn("COUNT", Sequelize.col("comment_id")), "comment_count"],
    ],
    include: [
      {
        model: free_comment,
        attributes: [],
      },
    ],
    group: ["post_id"],
  };
  options.where = additionalOptions;
  if (ifComment) {
    options.include[0].where = additionalOptions;
    options.include[0].attributes = ["content"];
  }
  if (model == "free") {
    return await free_board.findAll(options);
  } else if (model == "univ") {
    options.include[0].model = univ_comment;
    return await univ_board.findAll(options);
  }
};

const getLikesFromPosts = async (model, user_id, posts) => {
  if (model == "free") {
    likeModel = free_like;
  } else if (model == "univ") {
    likeModel = univ_like;
  }

  for (let i = 0; i < posts.length; i++) {
    let is_like = false;
    my_like = await likeModel.findOne({
      where: {
        user_id,
        post_id: posts[i].post_id,
      },
    });
    if (my_like) {
      is_like = true;
    }
    all_like = await likeModel.findAll({
      where: { post_id: posts[i].post_id },
    });
    posts[i].like = {
      is_like,
      all_like: all_like.length,
    };
  }
  return posts;
};

const delUser = async (user_id) => {
  await free_board.destroy({
    where: { user_id },
  });
  await free_comment.destroy({
    where: { user_id },
  });
  await univ_board.destroy({
    where: { user_id },
  });
  await univ_comment.destroy({
    where: { user_id },
  });
  await vote.destroy({
    where: { user_id },
  });
  await user.destroy({
    where: { user_id },
  });
};

const findUniv = async (field) => {
  return await university.findOne({
    where: field,
  });
};

const updateTarget = async (target, field) => {
  await target.update(field);
};

const concatenateArray = (free, univ) => {
  free.forEach(function (e) {
    e.board = "free";
  });
  univ.forEach(function (e) {
    e.board = "univ";
  });
  console.log(free.concat(univ));
  return free.concat(univ);
};

module.exports = {
  findUser,
  createUser,
  findPosts,
  getLikesFromPosts,
  delUser,
  findUniv,
  updateTarget,
  concatenateArray,
};
