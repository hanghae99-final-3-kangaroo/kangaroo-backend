const express = require("express");
const router = express.Router();

const { free_board, issue, sequelize } = require("../models");
const { Sequelize } = require("sequelize");

const schedule = require("node-schedule");

schedule.scheduleJob("31 8 * * * *", async function () {
  console.log(new Date().toJSON() + " 마다 갱신");

  // 저번 회차 이슈 게시글 삭제
  await issue.destroy({
    where: {},
  });

  // 현재 시각 기준, 24시간 전까지의 게시글 조회
  let issue_post = await sequelize.query(
    "select free_board.post_id,\
    free_board.view_count\
    + count(distinct free_comment.user_id) * 10\
    + count(distinct free_like.user_id) * 20\
    as sum from free_board \
    left join free_comment\
    on free_board.post_id = free_comment.post_id\
    left join free_like\
    on free_board.post_id = free_like.post_id\
    WHERE free_board.createdAt BETWEEN DATE_ADD(NOW(),INTERVAL -1 DAY ) AND NOW()\
    group by free_board.post_id;",
    { type: Sequelize.QueryTypes.SELECT }
  );

  // 새로운 인기 게시글 생성
  await issue.bulkCreate(issue_post, { returning: true });
});

router.get("/", async (req, res, next) => {
  try {
    // 생성된 인기 게시글 조회
    let issue_post_result = await issue.findAll({
      limit: 10,
      order: [["sum", "DESC"]],
      include: [{ model: free_board }],
      attributes: {
        exclude: ["issue_id", "createdAt", "updatedAt", "sum"],
      },
    });

    let img_list;
    for (i = 0; i < issue_post_result.length; i++) {
      img_list = issue_post_result[i]["free_board"]["img_list"];
      if (img_list != null) {
        img_list = img_list.split(",");
      } else {
        img_list = [];
      }
      issue_post_result[i]["free_board"].img_list = img_list;
    }

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
