const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class univ_like extends Model {
    static associate(models) {
      univ_like.belongsTo(models.user, { foreignKey: "user_id" });
      univ_like.belongsTo(models.univ_board, { foreignKey: "post_id" });
    }
  }
  univ_like.init(
    {
      univ_like_id: {
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
      modelName: "univ_like",
    }
  );
  return univ_like;
};
