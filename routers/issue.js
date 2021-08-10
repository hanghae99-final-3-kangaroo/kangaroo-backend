const express = require("express");
const router = express.Router();

const { free_board, free_comment, free_like, issue } = require("../models");
const { Sequelize } = require("sequelize");

const schedule = require("node-schedule");

const Op = Sequelize.Op;

let issue_post_result;

schedule.scheduleJob("31 8 * * * *", async function () {
  let mNow = new Date();

  console.log(mNow);
  console.log("8분 31초 마다 실행");

  // 저번 회차 이슈 게시글 삭제
  await issue.destroy({
    where: {},
  });

  // 현재 시각 기준, 24시간 전까지의 게시글 조회
  const get_free_post = await free_board.findAll({
    where: {
      createdAt: {
        [Op.gt]: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
    include: [
      {
        model: free_comment,
      },
      {
        model: free_like,
      },
    ],
  });

  // 조회한 게시글마다 조회수, 댓글수, 좋아요수 합산하여 배열로 저장
  let issue_post = [];
  let post_id, sum;

  for (let i = 0; i < get_free_post.length; i++) {
    let issue_obj = {};

    post_id = get_free_post[i]["post_id"];
    sum =
      get_free_post[i]["free_likes"].length * 20 +
      get_free_post[i]["free_comments"].length * 10 +
      get_free_post[i]["view_count"];

    issue_obj.post_id = post_id;
    issue_obj.sum = sum;

    issue_post.push(issue_obj);
  }

  // 새로운 인기 게시글 생성
  await issue.bulkCreate(issue_post, { returning: true });
});

router.get("/", async (req, res, next) => {
  try {
    // 생성된 인기 게시글 조회
    issue_post_result = await issue.findAll({
      limit: 10,
      order: [["sum", "DESC"]],
      include: [{ model: free_board }],
      attributes: {
        exclude: ["issue_id", "createdAt", "updatedAt", "sum"],
      },
    });

    res.status(200).send({
      result: issue_post_result,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 이슈 조회 실패`,
    });
  }
});

module.exports = router;
