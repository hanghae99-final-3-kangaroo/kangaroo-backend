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
router.get("/sample2", async (req, res, next) => {
  try {
    await country.create({
      name: "베트남",
    });
    await country.create({
      name: "호주",
    });
    await country.create({
      name: "미국",
    });
    await country.create({
      name: "캐나다",
    });
    await country.create({
      name: "영국",
    });
    res.status(200).send("가상 데이터 생성 성공");
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

router.get("/sample3", async (req, res, next) => {
  try {
    //베트남
    await university.create({
      name: "하노이 국립대",
      country_id: 1,
      email_domain: "vnu.edu.vn",
    });
    await university.create({
      name: "똔득탕 대학교",
      country_id: 1,
      email_domain: "tdtu.edu.vn",
    });
    await university.create({
      name: "호치민 인사대",
      country_id: 1,
      email_domain: "vns.edu.vn",
    });
    await university.create({
      name: "호치민 사범대",
      country_id: 1,
      email_domain: "hcmue.edu.vn",
    });
    await university.create({
      name: "RMIT",
      country_id: 1,
      email_domain: "rmit.edu.vn",
    });
    //호주
    await university.create({
      name: "시드니 대학교",
      country_id: 2,
      email_domain: "uni.sydney.edu.au",
    });
    await university.create({
      name: "뉴사우스웨일즈 대학교",
      country_id: 2,
      email_domain: "unsw.edu.au",
    });
    await university.create({
      name: "unsw.edu.au",
      country_id: 2,
      email_domain: "student.unimelb.edu.au",
    });
    await university.create({
      name: "퀸즐랜드 대학교",
      country_id: 2,
      email_domain: "uqconnect.edu.au",
    });
    await university.create({
      name: "퀸즐랜드 공과대학",
      country_id: 2,
      email_domain: "connect.qut.edu.au",
    });

    //미국
    await university.create({
      name: "New York University",
      country_id: 3,
      email_domain: "nyu.edu",
    });
    await university.create({
      name: "University Of Illinois at Urbana Champaign",
      country_id: 3,
      email_domain: "illinois.edu",
    });
    await university.create({
      name: "University of California - Berkely",
      country_id: 3,
      email_domain: "ucla.edu",
    });
    await university.create({
      name: "University of Southern California",
      country_id: 3,
      email_domain: "usc.edu",
    });
    await university.create({
      name: "Columbia University in the City of New York",
      country_id: 3,
      email_domain: "columbia.edu",
    });
    await university.create({
      name: "UCLA",
      country_id: 3,
      email_domain: "humnet.ucla.edu",
    });
    await university.create({
      name: "Cornell University",
      country_id: 3,
      email_domain: "cornell.edu",
    });
    await university.create({
      name: "Carnegie Mellon University",
      country_id: 3,
      email_domain: "andrew.cmu.edu",
    });
    await university.create({
      name: "University of Pennsylvania",
      country_id: 3,
      email_domain: "upenn.edu",
    });
    await university.create({
      name: "University of Michigan",
      country_id: 3,
      email_domain: "umich.edu",
    });
    await university.create({
      name: "Duke University",
      country_id: 3,
      email_domain: "alumni.duke.edu",
    });

    //캐나다
    await university.create({
      name: "Waterloo University",
      country_id: 4,
      email_domain: "edu.uwaterloo.ca",
    });
    await university.create({
      name: "University of Toronto",
      country_id: 4,
      email_domain: "mail.utoronto.ca",
    });
    await university.create({
      name: "Mcgill University",
      country_id: 4,
      email_domain: "mcgill.ca",
    });
    await university.create({
      name: "The British Columbia University",
      country_id: 4,
      email_domain: "student.ubc.ca",
    });
    await university.create({
      name: "The university of Alberta",
      country_id: 4,
      email_domain: "ualberta.ca",
    });
    res.status(200).send("가상 데이터 생성 성공");
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

module.exports = router;
