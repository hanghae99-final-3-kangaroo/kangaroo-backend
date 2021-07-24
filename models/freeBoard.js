const Sequelize = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class freeBoard extends Model {
    static associate(models) {
      freeBoard.belongsTo(models.user,{foreignKey : 'userId'});
      freeBoard.hasMany(models.freeComment,{foreignKey : 'commentId'});
    }
  };
  freeBoard.init({
    postId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: Sequelize.INTEGER,
    title: Sequelize.STRING,
    content: Sequelize.STRING,
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
  }, {
    sequelize,
    modelName: 'freeBoard',
  });
  return freeBoard;
};