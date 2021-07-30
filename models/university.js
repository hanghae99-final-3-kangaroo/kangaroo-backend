const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class university extends Model {
    static associate(models) {
      university.hasMany(models.user, { foreignKey: "univ_id" });
      university.hasMany(models.univ_board, { foreignKey: "univ_id" });
      university.hasMany(models.election, { foreignKey: "univ_id" });
      // university.hasOne(models.user, { foreignKey: "admin_id" }); // admin_id ~?
      university.belongsTo(models.country, { foreignKey: "country_id" });
    }
  }
  university.init(
    {
      univ_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      country_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      email_domain: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      admin_id: Sequelize.INTEGER,
    },
    {
      sequelize,
      modelName: "university",
    }
  );
  return university;
};
