const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class candidate extends Model {
    static associate(models) {
      candidate.belongsTo(models.election, { foreignKey: "election_id" });
    }
  }
  candidate.init(
    {
      candidate_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      election_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      major: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      photo: Sequelize.STRING,
    },
    {
      sequelize,
      modelName: "candidate",
    }
  );
  return candidate;
};
