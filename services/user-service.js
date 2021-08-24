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
  issue,
  sequelize,
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

const findComments = async (model, user_id) => {
  const myComments = await sequelize.query(
    `
  select *,"${model}" as board,${model}_comment.content as comment_content,${model}_comment.createdAt as comment_createdAt,
  (count(${model}_comment.comment_id) over (partition by ${model}_board.post_id)) as comment_count 
  from ${model}_board
  inner join ${model}_comment on ${model}_board.post_id=${model}_comment.post_id 
  where ${model}_comment.user_id=${user_id}`,
    { type: Sequelize.QueryTypes.SELECT }
  );

  return myComments;
};
const findPosts = async (model, additionalOptions) => {
  const options = {
    subQuery: false,
    raw: true,
    order: [["createdAt", "DESC"]],
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

  let ret;
  if (model == "free") {
    ret = await free_board.findAndCountAll(options);
  } else if (model == "univ") {
    options.include[0].model = univ_comment;
    ret = await univ_board.findAndCountAll(options);
  }
  ret["count"] = ret["count"].length;
  return ret;
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
  await issue.destroy({
    where: { user_id },
  });
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
const concatenateComment = (free, univ) => {
  let ret = [];
  let countPage = 0;
  if (free) {
    countPage += free.length;
    ret = ret.concat(free);
  }
  if (univ) {
    countPage += univ.length;
    ret = ret.concat(univ);
  }
  ret["countPage"] = countPage;
  return ret;
};
const concatenateArray = (free, univ) => {
  let ret = [];
  let countPage = 0;
  if (free) {
    countPage += free["count"];
    free = free["rows"];
    free.forEach(function (e) {
      e.board = "free";
    });
    ret = ret.concat(free);
  }
  if (univ) {
    countPage += univ["count"];
    univ = univ["rows"];
    univ.forEach(function (e) {
      e.board = "univ";
    });
    ret = ret.concat(univ);
  }
  ret["countPage"] = countPage;
  return ret;
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
  findComments,
  concatenateComment,
};
