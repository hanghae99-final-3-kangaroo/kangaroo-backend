const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class sample_vote extends Model {
    static associate(models) {
      sample_vote.belongsTo(models.user, { foreignKey: "user_id" });
    }
  }
  sample_vote.init(
    {
      sample_vote_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
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
      modelName: "sample_vote",
    }
  );
  return sample_vote;
};
