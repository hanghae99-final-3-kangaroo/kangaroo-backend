const express = require("express");
const { election, university, country, vote } = require("../models");
const router = express.Router(); // 라우터라고 선언한다.
const Sequelize = require("sequelize");

router.post("/", async (req, res) => {
  const {
    name,
    content,
    country_id,
    univ_id,
    candidate_1,
    candidate_2,
    candidate_3,
    candidate_4,
    candidate_5,
    end_date,
  } = req.body;
  try {
    const createdElection = await election.create({
      name,
      content,
      country_id,
      univ_id,
      candidate_1,
      candidate_2,
      candidate_3,
      candidate_4,
      candidate_5,
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

router.get("/:election_id", async (req, res, next) => {
  const { election_id } = req.params;
  try {
    const myElection = await election.findOne({
      where: { election_id },
      include: [
        { model: university, attributes: ["name"] },
        { model: country, attributes: ["name"] },
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

router.put("/:election_id", async (req, res) => {
  const { election_id } = req.params;
  const {
    name,
    content,
    country_id,
    univ_id,
    candidate_1,
    candidate_2,
    candidate_3,
    candidate_4,
    candidate_5,
    end_date,
  } = req.body;
  try {
    await election.update(
      {
        name,
        content,
        country_id,
        univ_id,
        candidate_1,
        candidate_2,
        candidate_3,
        candidate_4,
        candidate_5,
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

router.post("/vote", async (req, res) => {
  const { user_id, election_id, vote_num } = req.body;
  try {
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

router.get("/:election_id/result", async (req, res) => {
  const { election_id } = req.params;
  const { user_id } = req.body;
  try {
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
