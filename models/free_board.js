const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class free_board extends Model {
    static associate(models) {
      free_board.hasMany(models.free_comment, { foreignKey: "post_id" });
      free_board.hasMany(models.free_like, { foreignKey: "post_id" });
      free_board.belongsTo(models.user, { foreignKey: "user_id" });
      free_board.belongsTo(models.country, { foreignKey: "country_id" });
    }
  }
  free_board.init(
    {
      post_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      country_id: {
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
      view_count: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      img_list: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "free_board",
    }
  );
  return free_board;
};
