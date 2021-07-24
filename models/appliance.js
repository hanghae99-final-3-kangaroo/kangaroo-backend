const Sequelize = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class appliance extends Model {
    static associate(models) {
      appliance.belongsTo(models.university,{foreignKey : 'univId'});
      appliance.belongsTo(models.user,{foreignKey : 'userId'});
      appliance.belongsTo(models.department,{foreignKey : 'deptId'});
    }
  };
  appliance.init({
    applyId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: Sequelize.INTEGER,
    univId: Sequelize.INTEGER,
    deptId: Sequelize.INTEGER,
    status: Sequelize.INTEGER
  }, {
    sequelize,
    modelName: 'appliance',
  });
  return appliance;
};