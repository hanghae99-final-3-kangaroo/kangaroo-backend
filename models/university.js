const Sequelize = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class university extends Model {
    static associate(models) {
        university.hasMany(models.appliance);
        university.hasMany(models.department);
    }
  };
  university.init({
    univId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    siteUrl: Sequelize.STRING,
    univName: Sequelize.STRING,
    univInfo: Sequelize.STRING,
    mapX: Sequelize.STRING,
    mapY: Sequelize.STRING,
    rank: Sequelize.INTEGER,
    videoUrl: Sequelize.STRING,
    document: Sequelize.STRING,
    applySAT: Sequelize.BOOLEAN,
    applyNormal: Sequelize.BOOLEAN,
    applyEnd: Sequelize.STRING,
    cost: Sequelize.STRING
  }, {
    sequelize,
    modelName: 'university',
  });
  return university;
};