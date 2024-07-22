const MODEL_NAME = 'AtBrowsers';

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    MODEL_NAME,
    {
      atId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'At',
          key: 'id'
        }
      },
      browserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Browser',
          key: 'id'
        }
      },
      isCandidate: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      isRecommended: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    },
    {
      timestamps: false,
      tableName: MODEL_NAME
    }
  );
};
