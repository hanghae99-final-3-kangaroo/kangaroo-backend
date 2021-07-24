const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class department extends Model {
    static associate(models) {
      department.hasMany(models.appliance, { foreignKey: "applyId" });
      department.belongsTo(models.university, { foreignKey: "univId" });
    }
  }
  department.init(
    {
      deptId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      univId: Sequelize.INTEGER,
      deptName: Sequelize.STRING,
      deptClass: Sequelize.STRING,
      deptInfo: Sequelize.STRING,
      studyTerm: Sequelize.STRING,
    },
    {
      sequelize,
      modelName: "department",
    }
  );
  return department;
};
