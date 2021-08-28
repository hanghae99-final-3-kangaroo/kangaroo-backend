const { free_board, univ_board, candidate } = require("../models");

const findAllPost = async (board) => {
  if (board == "free") board = free_board;
  if (board == "univ") board = univ_board;

  const posts = await board.findAll({
    raw: true,
    attributes: ["img_list"],
  });

  let images = [];

  for (let i = 0; i < posts.length; i++) {
    if (posts[i]["img_list"] != null) {
      images = images.concat(posts[i]["img_list"].split(","));
    }
  }

  return images;
};

const findAllCandidate = async () => {
  const candidates = await candidate.findAll({
    raw: true,
    attributes: ["photo"],
  });

  let images = [];

  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i]["photo"] != null) {
      images = images.concat(candidates[i]["photo"]);
    }
  }

  return images;
};

module.exports = { findAllPost, findAllCandidate };
