const { free_board, issue, sequelize } = require("../models");
const { Sequelize } = require("sequelize");

// 저번 회차 이슈 게시글 삭제
const destroyIssue = async () => {
  return await issue.destroy({
    where: {},
  });
};

// 현재 시각 기준, 24시간 전까지의 게시글 조회
const calculateIssue = async () => {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  let endDate = new Date();
  endDate.setDate(endDate.getDate() - 7);
  let result = [];
  while (result.length < 4) {
    result = await sequelize.query(
      `select free_board.post_id,
          free_board.view_count
          + count(distinct free_comment.user_id) * 10
          + count(distinct free_like.user_id) * 20
          as sum from free_board 
          left join free_comment
          on free_board.post_id = free_comment.post_id
          left join free_like
          on free_board.post_id = free_like.post_id
          WHERE free_board.createdAt BETWEEN '${startDate
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")}' AND NOW()
          group by free_board.post_id;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    startDate.setHours(startDate.getHours() - 1);
    if (startDate < endDate) break;
  }
  return result;
};

// 새로운 인기 게시글 생성
const bulkCreateIssue = async (calIssue) => {
  await issue.bulkCreate(calIssue, { returning: true });
};

const findIssue = async () => {
  return await issue.findAll({
    limit: 10,
    order: [["sum", "DESC"]],
    include: [{ model: free_board }],
    attributes: {
      exclude: ["issue_id", "createdAt", "updatedAt", "sum"],
    },
  });
};

module.exports = {
  destroyIssue,
  calculateIssue,
  bulkCreateIssue,
  findIssue,
};
