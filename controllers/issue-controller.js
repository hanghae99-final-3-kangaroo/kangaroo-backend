const { issueService } = require("../services");

// 인기 게시글 생성
const createIssue = async () => {
  await issueService.destroyIssue(); // 저번 회차 이슈 게시글 삭제
  const calIssue = await issueService.calculateIssue();
  await issueService.bulkCreateIssue(calIssue);
};

// 생성된 인기 게시글 조회
const getIssue = async (req, res, next) => {
  try {
    let issue = await issueService.findIssue();

    // DB에 문자열로 저장된 이미지 리스트 값을 배열로 전환
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
