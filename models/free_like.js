const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class free_like extends Model {
    static associate(models) {
      free_like.belongsTo(models.user, { foreignKey: "user_id" });
      free_like.belongsTo(models.free_board, { foreignKey: "post_id" });
    }
  }
  free_like.init(
    {
      free_like_id: {
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
    },
    {
      sequelize,
      modelName: "free_like",
    }
  );
  return free_like;
};
