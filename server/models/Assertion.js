const MODEL_NAME = 'Assertion';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    MODEL_NAME,
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      testPlanVersionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'TestPlanVersion',
          key: 'id'
        }
      },
      testId: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      assertionIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      priority: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      rawAssertionId: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      assertionStatement: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      assertionPhrase: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      assertionExceptions: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      encodedId: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
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

  Model.TEST_PLAN_VERSION_ASSOCIATION = {
    foreignKey: 'testPlanVersionId',
    as: 'testPlanVersion'
  };

  Model.AT_BUGS_ASSOCIATION = {
    through: 'AssertionAtBug',
    as: 'atBugs'
  };

  Model.associate = function (models) {
    Model.belongsTo(models.TestPlanVersion, {
      ...Model.TEST_PLAN_VERSION_ASSOCIATION,
      targetKey: 'id'
    });

    Model.belongsToMany(models.AtBug, {
      ...Model.AT_BUGS_ASSOCIATION,
      foreignKey: 'assertionId',
      otherKey: 'atBugId'
    });
  };

  return Model;
};
