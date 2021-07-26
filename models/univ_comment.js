const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class univ_comment extends Model {
    static associate(models) {
      univ_comment.belongsTo(models.user, { foreignKey: "user_id" });
      univ_comment.belongsTo(models.univ_board, { foreignKey: "post_id" });
    }
  }
  univ_comment.init(
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
      // created_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      // },
      // updated_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      // },
    },
    {
      sequelize,
      modelName: "univ_comment",
    }
  );
  return univ_comment;
};
