const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class election extends Model {
    static associate(models) {
      election.hasMany(models.vote, { foreignKey: "election_id" });
      election.hasMany(models.candidate, { foreignKey: "election_id" });
      election.belongsTo(models.country, { foreignKey: "country_id" });
      election.belongsTo(models.university, { foreignKey: "univ_id" });
    }
  }
  election.init(
    {
      election_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      country_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      univ_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      start_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      end_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    },
    {
      sequelize,
      modelName: "election",
    }
  );
  return election;
};
