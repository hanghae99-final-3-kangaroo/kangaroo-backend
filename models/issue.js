const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class issue extends Model {
    static associate(models) {
      issue.belongsTo(models.free_board, { foreignKey: "post_id" });
    }
  }
  issue.init(
    {
      issue_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      post_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      sum: {
        type: Sequelize.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "issue",
    }
  );
  return issue;
};
