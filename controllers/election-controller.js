const fs = require("fs");

const path = require("path");
const appDir = path.dirname(require.main.filename);
const { electionService, boardService } = require("../services");

const postElection = async (req, res, next) => {
  const { user_id } = res.locals.user;
  const { name, content, univ_id, candidates, end_date, start_date } = req.body;
  try {
    if (candidates.length == 0) {
      res.status(403).send({
        ok: false,
        message: "입후보자가 없습니다.",
      });
      return;
    }

    if (new Date(start_date) > new Date(end_date)) {
      res.status(403).send({
        ok: false,
        message: "시작 시간 설정 종료 시간보다 뒤입니다.",
      });
      return;
    }

    if (new Date(end_date) < new Date()) {
      res.status(403).send({
        ok: false,
        message: "종료 시간 설정이 잘못 되었습니다.",
      });
      return;
    }

    const { admin_id: univAdmin, country_id } = await electionService.findUniv(
      univ_id
    );

    if (univAdmin == null) {
      res.status(403).send({
        ok: false,
        message: "대학 관리자가 설정되지 않았습니다.",
      });
      return;
    } else if (univAdmin != user_id) {
      res.status(401).send({
        ok: false,
        message: "대학 관리자가 아닙니다.",
      });
      return;
    }

    const createdElection = await electionService.createElection({
      name,
      content,
      country_id,
      univ_id,
      start_date,
      end_date,
    });

    candidates.forEach(function (c) {
      c.election_id = createdElection.election_id;
    });

    await electionService.bulkCreateCandidates(candidates);

    const myElection = await electionService.findElection(
      createdElection.election_id
    );

    res.status(200).send({
      ok: true,
      result: myElection,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
};

const getElectionList = async (req, res) => {
  const { univ_id, user_id } = res.locals.user;
  try {
    if (univ_id == null) {
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    }
    const elections = await electionService.findAllElection(univ_id, user_id);
    res.status(200).send({
      ok: true,
      result: elections,
    });
  } catch (err) {
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
};

const getElection = async (req, res) => {
  const { univ_id } = res.locals.user;
  const { election_id } = req.params;
  try {
    const myElection = await electionService.findElection(election_id);

    if (myElection == null) {
      res.status(403).send({
        ok: false,
        message: "개최되지 않은 선거입니다.",
      });
      return;
    }

    if (univ_id == null) {
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    } else if (univ_id != myElection.univ_id) {
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    }
    res.status(200).send({
      ok: true,
      result: myElection,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
};

const putElection = async (req, res) => {
  const { user_id } = res.locals.user;
  const { election_id } = req.params;
  const {
    name,
    content,
    country_id,
    univ_id,
    candidates,
    start_date,
    end_date,
  } = req.body;
  try {
    const electionCheck = await electionService.findElection(election_id);

    if (electionCheck == null) {
      res.status(403).send({
        ok: false,
        message: "없는 선거입니다.",
      });
      return;
    }

    const { admin_id: univAdmin } = await electionService.findUniv(univ_id);
    if (univAdmin == null) {
      res.status(403).send({
        ok: false,
        message: "대학 관리자가 설정되지 않았습니다.",
      });
      return;
    } else if (univAdmin != user_id) {
      res.status(401).send({
        ok: false,
        message: "대학 관리자가 아닙니다.",
      });
      return;
    }

    await electionService.putElection(
      {
        name,
        content,
        country_id,
        univ_id,
        start_date,
        end_date,
      },
      election_id
    );

    for (c of candidates) {
      await electionService.putCandidate(c, c.candidate_id);
    }
    const myElection = await electionService.findElection(election_id);
    res.status(200).send({
      ok: true,
      myElection,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
};

const delElection = async (req, res) => {
  const { election_id } = req.params;
  const { univ_id, user_id } = res.locals.user;
  try {
    const electionCheck = await electionService.findElection(election_id);

    if (electionCheck == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 선거입니다.",
      });
      return;
    }

    const { admin_id: univAdmin } = await electionService.findUniv(univ_id);

    if (univAdmin == null) {
      res.status(403).send({
        ok: false,
        message: "대학 관리자가 설정되지 않았습니다.",
      });
      return;
    } else if (univAdmin != user_id) {
      res.status(401).send({
        ok: false,
        message: "대학 관리자가 아닙니다.",
      });
      return;
    }
    const myCandidates = await electionService.findAllCandidates(election_id);

    for (myCandidate of myCandidates) {
      if (myCandidate.photo)
        fs.unlinkSync(appDir + "/public/" + myCandidate.photo);
      myCandidate.destroy();
    }
    await electionService.delVotes(election_id);
    await electionService.delElection(election_id);
    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
};

const doVote = async (req, res) => {
  const { candidate_id } = req.body;
  const { user_id, univ_id } = res.locals.user;
  const { election_id } = req.params;
  try {
    const electionCheck = await electionService.findElection(election_id);

    if (electionCheck == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 선거입니다.",
      });
      return;
    }

    if (univ_id == null) {
      //내가 다니는 대학이 없을 때
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    } else if (electionCheck.univ_id != univ_id) {
      //내가 다니는 대학이 아닐 때
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    } else if (electionCheck.start_date > new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 시작하지 않았습니다.",
      });
      return;
    } else if (electionCheck.end_date < new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 지났습니다.",
      });
      return;
    } else {
      // 이미 투표했는지 체크
      const checkVote = await electionService.findVote(user_id, election_id);

      if (checkVote) {
        res.status(403).send({
          ok: false,
          message: "이미 투표하였습니다.",
        });
        return;
      }
    }

    const createdVote = await electionService.createVote({
      user_id,
      election_id,
      candidate_id,
    });
    res.status(200).send({
      ok: true,
      result: createdVote,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
};

const voteResult = async (req, res) => {
  const { election_id } = req.params;
  const { univ_id } = res.locals.user;
  try {
    const electionCheck = await electionService.findElection(election_id);
    if (univ_id == null) {
      //내가 다니는 대학이 없을 때
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    } else if (electionCheck.univ_id != univ_id) {
      //내가 다니는 대학이 아닐 때
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    } else if (electionCheck.end_date > new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 끝나지 않았습니다.",
      });
      return;
    }

    const countVote = await electionService.countVote(election_id);
    res.status(200).send({
      ok: true,
      result: countVote,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
};

const makeComment = async (req, res, next) => {
  try {
    const { user_id, univ_id } = res.locals.user;

    const { election_id, content } = req.body;

    const electionCheck = await electionService.findElection(election_id);

    if (electionCheck == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 선거 입니다.",
      });
      return;
    }
    if (univ_id == null) {
      //내가 다니는 대학이 없을 때
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    } else if (electionCheck.univ_id != univ_id) {
      //내가 다니는 대학이 아닐 때
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    } else if (electionCheck.end_date > new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 끝나지 않았습니다.",
      });
      return;
    }

    const result = await boardService.createComment(
      "election",
      user_id,
      election_id,
      content
    );

    res.status(200).send({
      result,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 댓글 작성 실패`,
    });
  }
};

const getComment = async (req, res, next) => {
  try {
    const { univ_id } = res.locals.user;
    const { election_id } = req.params;
    const result = await boardService.findAllComment("election", election_id);

    const electionCheck = await electionService.findElection(election_id);
    if (result.length == 0) {
      res.status(200).send({
        result,
        ok: true,
        message: "댓글이 없습니다.",
      });
      return;
    }

    if (univ_id == null) {
      //내가 다니는 대학이 없을 때
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    } else if (electionCheck.univ_id != univ_id) {
      //내가 다니는 대학이 아닐 때
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    } else if (electionCheck.end_date > new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 끝나지 않았습니다.",
      });
      return;
    }
    res.status(200).send({
      result,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 댓글 조회 실패`,
    });
  }
};

const putComment = async (req, res, next) => {
  try {
    const { user_id } = res.locals.user;
    const { comment_id } = req.params;
    const { content } = req.body;

    const result = await boardService.findOneComment("election", comment_id);

    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "댓글이 없습니다",
      });
      return;
    }

    if (user_id != result.user_id) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    const newComment = await boardService.updateComment(
      "election",
      comment_id,
      content
    );

    res.status(200).send({
      result: newComment,
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 댓글 수정 실패`,
    });
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { user_id, univ_id } = res.locals.user;
    const { comment_id } = req.params;

    const result = await boardService.findOneComment("election", comment_id);

    const electionCheck = await electionService.findElection(result.post_id);
    if (result == null) {
      res.status(403).send({
        ok: false,
        message: "댓글이 없습니다",
      });
      return;
    }

    if (univ_id == null) {
      //내가 다니는 대학이 없을 때
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    } else if (electionCheck.univ_id != univ_id) {
      //내가 다니는 대학이 아닐 때
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    } else if (electionCheck.end_date > new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 끝나지 않았습니다.",
      });
      return;
    }
    if (user_id != result["user_id"]) {
      return res.status(401).send({ ok: false, message: "작성자가 아닙니다" });
    }

    await boardService.destroyComment("election", comment_id);

    res.status(200).send({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err} : 게시글 삭제 실패`,
    });
  }
};

module.exports = {
  postElection,
  getElectionList,
  getElection,
  putElection,
  delElection,
  doVote,
  voteResult,
  makeComment,
  getComment,
  putComment,
  deleteComment,
};
