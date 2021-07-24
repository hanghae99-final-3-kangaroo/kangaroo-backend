const Sequelize = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
        user.hasMany(models.freeBoard,{foreignKey : 'postId'});
        user.hasMany(models.freeComment,{foreignKey : 'commentId'});
        user.hasMany(models.appliance,{foreignKey : 'applyId'});
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