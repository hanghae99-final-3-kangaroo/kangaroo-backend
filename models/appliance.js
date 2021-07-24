const Sequelize = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class appliance extends Model {
    static associate(models) {
      appliance.belongsTo(models.university);
      appliance.belongsTo(models.user);
      appliance.belongsTo(models.department);
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