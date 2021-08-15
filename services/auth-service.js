const { university, user } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const updateUserRefreshToken = async (refresh_token, user_id) => {
  await user.update({ refresh_token }, { where: { user_id } });
  return true;
};

const findUnivByEmail = async (school_domain) => {
  return await university.findOne({
    where: {
      email_domain: {
        [Op.like]: "%" + school_domain,
      },
    },
  });
};

const findUser = async (field) => {
  return await user.findOne({
    where: field,
  });
};

const updateUserByUserId = async (fields, user_id) => {
  await user.update(fields, {
    where: { user_id },
  });
  return true;
};

module.exports = {
  updateUserRefreshToken,
  findUnivByEmail,
  findUser,
  updateUserByUserId,
};
