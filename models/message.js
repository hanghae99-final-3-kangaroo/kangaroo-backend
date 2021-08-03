const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class message extends Model {
    static associate(models) {
      message.belongsTo(models.user, {
        foreignKey: {
          name: "from_id",
          allowNull: false,
        },
        as: "messageFrom",
        targetKey: "user_id",
      });
      message.belongsTo(models.user, {
        foreignKey: {
          name: "to_id",
          allowNull: false,
        },
        as: "messageTo",
        targetKey: "user_id",
      });
    }
  }
  message.init(
    {
      message_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      from_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      to_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      sentAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      openedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      opened: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "message",
    }
  );
  return message;
};
