const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
      user.hasMany(models.free_board, { foreignKey: "user_id" });
      user.hasMany(models.free_comment, { foreignKey: "user_id" });
      user.hasMany(models.univ_board, { foreignKey: "user_id" });
      user.hasMany(models.univ_comment, { foreignKey: "user_id" });
      // user.hasOne(models.university, { foreignKey: "user_id" }); // admin_id ~?
      user.hasMany(models.vote, { foreignKey: "user_id" });

      user.belongsTo(models.country, { foreignKey: "country_id" });
      user.belongsTo(models.university, { foreignKey: "univ_id" });
    }
  }
  user.init(
    {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      nickname: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      password: Sequelize.STRING,
      school_auth: Sequelize.BOOLEAN,
      school_email: Sequelize.STRING,
      country_id: Sequelize.INTEGER,
      univ_id: Sequelize.INTEGER,
      provider: Sequelize.STRING,
    },
    {
      sequelize,
      modelName: "user",
    }
  );
  return user;
};
