const express = require("express");
const { election, university, country, vote, candidate } = require("../models");
const router = express.Router(); // 라우터라고 선언한다.
const Sequelize = require("sequelize");
const authMiddleware = require("../middlewares/auth-middleware");
const multer = require("multer");
const randomstring = require("randomstring");
const fs = require("fs");

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${__dirname}/../public`); //저장할 폴더
    },
    filename: (req, file, cb) => {
      var fileName = randomstring.generate(25); // 파일 이름 - 랜덤
      var mimeType;
      switch (
        file.mimetype // 파일 타입
      ) {
        case "image/jpeg":
          mimeType = "jpg";
          break;
        case "image/png":
          mimeType = "png";
          break;
        case "image/gif":
          mimeType = "gif";
          break;
        case "image/bmp":
          mimeType = "bmp";
          break;
        default:
          mimeType = "jpg";
          break;
      }
      cb(null, fileName + "." + mimeType); // 파일 이름 + 파일 타입 형태로 이름 설정
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 크기제한 : 5byte
  },
});

router.post("/", authMiddleware, imageUpload.array("img"), async (req, res) => {
  const { user_id } = res.locals.user;
  const { name, content, univ_id, candidates, end_date, start_date } = req.body;
  try {
    const { admin_id: univAdmin, country_id } = await university.findOne({
      where: { univ_id },
      attributes: ["admin_id", "country_id"],
    });

    if (candidates.length == 0) {
      res.status(403).send({
        ok: false,
        message: "입후보자가 없습니다.",
      });
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
      start_date,
      end_date,
    });
    let i = 0;
    candidates.forEach(function (c) {
      c.election_id = createdElection.election_id;
      if (req.files) {
        c.photo = req.files[i].filename;
      }
      i += 1;
    });
    await candidate.bulkCreate(candidates);
    const myElection = await election.findOne({
      where: { election_id: createdElection.election_id },
      include: [
        { model: university, attributes: ["name"] },
        { model: country, attributes: ["name"] },
        { model: candidate },
      ],
    });

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

router.get("/", authMiddleware, async (req, res, next) => {
  const { univ_id } = res.locals.user;
  try {
    if (univ_id == null) {
      res.status(403).send({
        ok: false,
        message: "내가 재학중인 대학교가 없습니다.",
      });
      return;
    }
    const elections = await election.findAll({
      where: { univ_id },
      include: [
        { model: university, attributes: ["name"] },
        { model: country, attributes: ["name"] },
        { model: candidate },
      ],
    });
    res.status(200).send({
      ok: true,
      result: elections,
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
        { model: candidate },
      ],
      raw: true,
    });

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
});

router.put("/:election_id", authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  const { election_id } = req.params;
  const { name, content, country_id, univ_id, end_date } = req.body;
  try {
    const electionCheck = await election.findOne({
      where: { election_id },
    });

    if (electionCheck == null) {
      res.status(403).send({
        ok: false,
        message: "없는 선거입니다.",
      });
      return;
    }

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

router.delete("/:election_id", authMiddleware, async (req, res) => {
  const { election_id } = req.params;
  const { univ_id, user_id } = res.locals.user;
  try {
    const check_election = await election.findOne({
      where: { election_id },
    });

    if (check_election == null) {
      res.status(403).send({
        ok: false,
        message: "존재하지 않는 선거입니다.",
      });
      return;
    }

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
    const myCandidates = await candidate.findAll({ where: { election_id } });
    for (myCandidate of myCandidates) {
      fs.unlink("/public" + myCandidate.photo);
      myCandidate.destroy();
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
  const { candidate_id } = req.body;
  const { user_id, univ_id } = res.locals.user;
  const { election_id } = req.params;
  try {
    const myElection = await election.findOne({ where: { election_id } });

    if (myElection == null) {
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
    } else if (myElection.univ_id != univ_id) {
      //내가 다니는 대학이 아닐 때
      res.status(401).send({
        ok: false,
        message: "내가 재학중인 대학교가 아닙니다.",
      });
      return;
    } else if (myElection.start_date > new Date()) {
      //투표 기간이 지났을 때
      res.status(403).send({
        ok: false,
        message: "투표 기간이 시작하지 않았습니다.",
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

    const createdVote = await vote.create({
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
        "candidate_id",
        [Sequelize.fn("count", Sequelize.col("candidate_id")), "count"],
      ],
      where: {
        election_id,
      },
      group: ["candidate_id"],
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
