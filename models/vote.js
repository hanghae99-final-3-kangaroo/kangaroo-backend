const Sequelize = require("sequelize");
const { Model } = require("sequelize");
const election = require("./election");
const free_board = require("./free_board");

module.exports = (sequelize, DataTypes) => {
  class vote extends Model {
    static associate(models) {
      vote.belongsTo(models.user, { foreignKey: "user_id" });
      vote.belongsTo(models.election, { foreignKey: "election_id" });
    }
  }
  vote.init(
    {
      vote_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      election_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      vote_num: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "vote",
    }
  );
  return vote;
};
