const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class election_comment extends Model {
    static associate(models) {
      election_comment.belongsTo(models.user, { foreignKey: "user_id" });
      election_comment.belongsTo(models.election, {
        foreignKey: {
          name: "post_id",
          allowNull: false,
        },
        targetKey: "election_id",
      });
    }
  }
  election_comment.init(
    {
      comment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      post_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "election_comment",
    }
  );
  return election_comment;
};
