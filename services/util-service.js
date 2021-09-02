const {
  free_board,
  univ_board,
  candidate,
  sample_vote,
  user,
} = require("../models");

// 게시글 전체 조회
const findAllPost = async (board) => {
  if (board == "free") board = free_board;
  if (board == "univ") board = univ_board;

  const posts = await board.findAll({
    raw: true,
    attributes: ["img_list"],
  });

  let images = [];

  // DB에 문자열로 저장된 이미지 리스트 값을 배열로 전환
  for (let i = 0; i < posts.length; i++) {
    if (posts[i]["img_list"] != null) {
      images = images.concat(posts[i]["img_list"].split(","));
    }
  }

  return images;
};

// 후보자 전체 조회
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

const findVote = async (user_id) => {
  return await sample_vote.findOne({ where: { user_id } });
};

const createVote = async (fields) => {
  return await sample_vote.create(fields);
};

const updateSampleVote = async (user_id, sample_vote_id) => {
  await user.update({ sample_vote_id }, { where: { user_id } });
};
module.exports = {
  findAllPost,
  findAllCandidate,
  findVote,
  createVote,
  updateSampleVote,
};
