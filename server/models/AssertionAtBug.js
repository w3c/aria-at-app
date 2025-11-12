const MODEL_NAME = 'AssertionAtBug';

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    MODEL_NAME,
    {
      assertionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Assertion',
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
      commandId: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true
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
