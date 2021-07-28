const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class sessions extends Model {}
  sessions.init(
    {
      sid: {
        primaryKey: true,
        type: Sequelize.STRING,
      },
      expires: {
        type: Sequelize.DATE,
      },
      data: {
        allowNull: false,
        type: Sequelize.STRING(50000),
      },
    },
    {
      sequelize,
      modelName: "sessions",
    }
  );
  return sessions;
};
