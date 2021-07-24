const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class freeComment extends Model {
    static associate(models) {
      freeComment.belongsTo(models.user, { foreignKey: "userId" });
      freeComment.belongsTo(models.freeBoard, { foreignKey: "postId" });
    }
  }
  freeComment.init(
    {
      commentId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: Sequelize.INTEGER,
      boardId: Sequelize.INTEGER,
      content: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    },
    {
      sequelize,
      modelName: "freeComment",
    }
  );
  return freeComment;
};
