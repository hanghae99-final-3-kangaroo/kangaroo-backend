const express = require("express");
const { election, university, country, vote } = require("../models");
const router = express.Router(); // 라우터라고 선언한다.
const Sequelize = require("sequelize");
const authMiddleware = require("../middlewares/auth-middleware");

router.post("/", authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  const { name, content, country_id, univ_id, candidates, end_date } = req.body;
  try {
    const { admin_id: univAdmin } = await university.findOne({
      where: { univ_id },
      attributes: ["admin_id"],
    });
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

    const createdElection = await election.create({
      name,
      content,
      country_id,
      univ_id,
      candidate_1: candidates[0],
      candidate_2: candidates[1],
      candidate_3: candidates[2],
      candidate_4: candidates[3],
      candidate_5: candidates[4],
      end_date,
    });
    res.status(200).send({
      ok: true,
      result: createdElection,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      ok: false,
      message: `${err}`,
    });
  }
});

router.get("/:election_id", authMiddleware, async (req, res, next) => {
  const { univ_id } = res.locals.user;
  const { election_id } = req.params;
  try {
    const myElection = await election.findOne({
      where: { election_id },
      include: [
        { model: university, attributes: ["name"] },
        { model: country, attributes: ["name"] },
      ],
    });
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
});

router.put("/:election_id", authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  const { election_id } = req.params;
  const { name, content, country_id, univ_id, candidates, end_date } = req.body;
  try {
    const { admin_id: univAdmin } = await university.findOne({
      where: { univ_id },
      attributes: ["admin_id"],
    });
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

    await election.update(
      {
        name,
        content,
        country_id,
        univ_id,
        candidate_1: candidates[0],
        candidate_2: candidates[1],
        candidate_3: candidates[2],
        candidate_4: candidates[3],
        candidate_5: candidates[4],
        end_date,
      },
      {
        where: { election_id },
      }
    );
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
});

router.delete("/:election_id", async (req, res) => {
  const { election_id } = req.params;
  try {
    const { admin_id: univAdmin } = await university.findOne({
      where: { univ_id },
      attributes: ["admin_id"],
    });
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
    await vote.destroy({
      where: { election_id },
    });
    await election.destroy({
      where: { election_id },
    });
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
});

router.post("/vote/:election_id", authMiddleware, async (req, res) => {
  const { vote_num } = req.body;
  const { user_id, univ_id } = res.locals.user;
  const { election_id } = req.params;
  try {
    const myElection = await election.findOne({ where: { election_id } });
    if (univ_id == null) {
      //내가 다니는 대학이 없을 때
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    } else if (myElection.univ_id != univ_id) {
      //내가 다니는 대학이 아닐 때
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    } else if (myElection.end_date < new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 지났습니다.",
      });
      return;
    } else {
      // 이미 투표했는지 체크
      const checkVote = await vote.findOne({ where: { user_id, election_id } });
      if (checkVote) {
        res.status(403).send({
          ok: false,
          message: "이미 투표하였습니다.",
        });
        return;
      }
    }

    //이미 투표했을 때

    const createdVote = await vote.create({ user_id, election_id, vote_num });
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
});

router.get("/:election_id/result", authMiddleware, async (req, res) => {
  const { election_id } = req.params;
  const { univ_id } = res.locals.user;
  try {
    const myElection = await election.findOne({ where: { election_id } });
    if (univ_id == null) {
      //내가 다니는 대학이 없을 때
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    } else if (myElection.univ_id != univ_id) {
      //내가 다니는 대학이 아닐 때
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    } else if (myElection.end_date > new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 끝나지 않았습니다.",
      });
      return;
    }

    const countVote = await vote.findAll({
      attributes: [
        "vote_num",
        [Sequelize.fn("count", Sequelize.col("vote_num")), "count"],
      ],
      where: {
        election_id,
      },
      group: ["vote_num"],
    });
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
});

module.exports = router;
