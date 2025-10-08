const MODEL_NAME = 'NegativeSideEffect';

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
      testPlanRunId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'TestPlanRun',
          key: 'id'
        }
      },
      testResultId: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'The test result ID from TestPlanRun.testResults JSONB'
      },
      scenarioResultId: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'The scenario result ID from TestPlanRun.testResults JSONB'
      },
      negativeSideEffectId: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment:
          'The ID from negativeSideEffects.json (e.g., EXCESSIVELY_VERBOSE)'
      },
      impact: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'SEVERE, MODERATE, etc.'
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional details provided by the tester'
      },
      highlightRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment:
          'Whether a highlight was required for this negative side effect'
      },
      encodedId: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        comment:
          'The encoded negative side effect ID (for backward compatibility)'
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

  Model.TEST_PLAN_RUN_ASSOCIATION = {
    foreignKey: 'testPlanRunId',
    as: 'testPlanRun'
  };

  // Note: testResultId and scenarioResultId are TEXT fields referencing JSONB data
  // They don't have foreign key relationships since they reference data within TestPlanRun.testResults

  Model.AT_BUGS_ASSOCIATION = {
    through: 'NegativeSideEffectAtBug',
    as: 'atBugs'
  };

  Model.associate = function (models) {
    Model.belongsTo(models.TestPlanRun, Model.TEST_PLAN_RUN_ASSOCIATION);
    Model.belongsToMany(models.AtBug, {
      through: models.NegativeSideEffectAtBug,
      foreignKey: 'negativeSideEffectId',
      otherKey: 'atBugId',
      as: 'atBugs'
    });
  };

  return Model;
};
