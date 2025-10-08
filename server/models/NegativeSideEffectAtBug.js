const MODEL_NAME = 'NegativeSideEffectAtBug';

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    MODEL_NAME,
    {
      negativeSideEffectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'NegativeSideEffect',
          key: 'id'
        }
      },
      atBugId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'AtBug',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: true,
      tableName: MODEL_NAME
    }
  );
};

