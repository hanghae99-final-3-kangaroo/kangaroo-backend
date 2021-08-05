const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class univ_board extends Model {
    static associate(models) {
      univ_board.hasMany(models.univ_comment, { foreignKey: "post_id" });
      univ_board.belongsTo(models.user, { foreignKey: "user_id" });
      univ_board.belongsTo(models.university, { foreignKey: "univ_id" });
    }
  }
  univ_board.init(
    {
      post_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      univ_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      category: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      is_fixed: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      view_count: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "univ_board",
    }
  );
  return univ_board;
};
