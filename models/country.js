const Sequelize = require("sequelize");
const { Model } = require("sequelize");
const free_board = require("./free_board");

module.exports = (sequelize, DataTypes) => {
  class country extends Model {
    static associate(models) {
      country.hasMany(models.free_board, { foreignKey: "country_id" });
      country.hasMany(models.user, { foreignKey: "country_id" });
      country.hasMany(models.university, { foreignKey: "country_id" });
      country.hasMany(models.election, { foreignKey: "country_id" });
    }
  }
  country.init(
    {
      country_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "country",
    }
  );
  return country;
};
