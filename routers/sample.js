const express = require("express");
const {
  user,
  country,
  free_board,
  free_comment,
  univ_board,
  univ_comment,
  university,
  election,
  vote,
} = require("../models");
const router = express.Router(); // 라우터라고 선언한다.

router.get("/sample", async (req, res, next) => {
  try {
    await user.create({
      email: "yzkim9501@naver.com",
      nickname: "예지예지",
      password: "1234",
    });
    await country.create({
      name: "대한민국",
    });
    await free_board.create({
      user_id: 1,
      country_id: 1,
      title: "빨리해라",
      content: "대충 뉘앙스는 맞았어",
      category: 1,
    });
    await free_comment.create({
      user_id: 1,
      post_id: 1,
      content: "아 선언 했다고!!!!",
    });
    await university.create({
      name: "감귤대학교",
      country_id: 1,
    });
    await univ_board.create({
      univ_id: 1,
      user_id: 1,
      title: "보이는데 안 보이네?",
      content: "당 장 버 려",
      category: 1,
      is_fixed: true,
    });
    await univ_comment.create({
      user_id: 1,
      post_id: 1,
      content: "역시 개발할 때가 제일 좋아",
    });
    await election.create({
      country_id: 1,
      univ_id: 1,
      name: "내가 짱이다. 니가 그렇게 개발을 잘 해?",
      content: "덤벼",
      candidate_1: "장상현",
      end_date: "2021-07-26 09:10:19",
    });
    await vote.create({
      election_id: 1,
      user_id: 1,
      vote_num: 5,
    });

    res.status(200).send("가상 데이터 생성 성공");
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

module.exports = router;
