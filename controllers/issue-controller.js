const { issueService } = require("../services");

const createIssue = async () => {
  await issueService.destroyIssue();
  const calIssue = await issueService.calculateIssue();
  await issueService.bulkCreateIssue(calIssue);
};

const getIssue = async (req, res, next) => {
  try {
    // 생성된 인기 게시글 조회
    let issue = await issueService.findIssue();

    let img_list;
    for (i = 0; i < issue.length; i++) {
      img_list = issue[i]["free_board"]["img_list"];
      if (img_list != null) {
        img_list = img_list.split(",");
      } else {
        img_list = [];
      }
      issue[i]["free_board"].img_list = img_list;
    }

    res.status(200).send({
      result: issue,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 이슈 조회 실패`,
    });
  }
};

module.exports = {
  createIssue,
  getIssue,
};
