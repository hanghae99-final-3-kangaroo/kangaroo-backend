const Sequelize = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
        user.hasMany(models.freeBoard);
        user.hasMany(models.freeComment);
        user.hasMany(models.appliance);
    }
  };
  user.init({
    userId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    phone: Sequelize.STRING,
    realName: Sequelize.STRING,
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};