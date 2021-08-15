const { university, election, candidate, country, vote } = require("../models");

const findUniv = async (univ_id) => {
  return await university.findOne({
    where: { univ_id },
    attributes: ["admin_id", "country_id"],
  });
};

const createElection = async (fields) => {
  return await election.create(fields);
};

const bulkCreateCandidates = async (candidates) => {
  await candidate.bulkCreate(candidates);
};

const findElection = async (election_id) => {
  return await election.findOne({
    where: { election_id },
    include: [
      { model: university, attributes: ["name"] },
      { model: country, attributes: ["name"] },
      { model: candidate },
    ],
  });
};

const findAllElection = async (univ_id, user_id) => {
  return await election.findAll({
    where: { univ_id },
    include: [
      { model: university, attributes: ["name"] },
      { model: country, attributes: ["name"] },
      { model: candidate },
      {
        model: vote,
        required: false,
        where: { user_id },
        attributes: ["vote_id"],
      },
    ],
  });
};

const findAllCandidates = async (election_id) => {
  return await candidate.findAll({ where: { election_id } });
};

const putElection = async (fields, election_id) => {
  await election.update(fields, { where: { election_id } });
};

const putCandidate = async (fields, candidate_id) => {
  await candidate.update(fields, { where: { candidate_id } });
};

const delVotes = async (election_id) => {
  await vote.destroy({ where: { election_id } });
};

const delElection = async (election_id) => {
  await election.destroy({ where: { election_id } });
};

const findVote = async (user_id, election_id) => {
  return await vote.findOne({ where: { user_id, election_id } });
};

const createVote = async (fields) => {
  return await vote.create(fields);
};

const countVote = async (election_id) => {
  return await vote.findAll({
    attributes: [
      "candidate_id",
      [Sequelize.fn("count", Sequelize.col("candidate_id")), "count"],
    ],
    where: {
      election_id,
    },
    group: ["candidate_id"],
  });
};

module.exports = {
  findUniv,
  createElection,
  bulkCreateCandidates,
  findElection,
  findAllElection,
  putElection,
  putCandidate,
  findAllCandidates,
  delVotes,
  delElection,
  findVote,
  createVote,
  countVote,
};
