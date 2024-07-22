const MODEL_NAME = 'TestPlan';

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
      title: { type: DataTypes.TEXT },
      directory: { type: DataTypes.TEXT }
    },
    {
      timestamps: false,
      tableName: MODEL_NAME
    }
  );

  Model.TEST_PLAN_VERSION_ASSOCIATION = { as: 'testPlanVersions' };

  Model.TEST_PLAN_REPORT_ASSOCIATION = { as: 'testPlanReports' };

  Model.associate = function (models) {
    Model.hasMany(models.TestPlanVersion, {
      ...Model.TEST_PLAN_VERSION_ASSOCIATION,
      foreignKey: 'testPlanId',
      sourceKey: 'id'
    });

    Model.hasMany(models.TestPlanReport, {
      ...Model.TEST_PLAN_REPORT_ASSOCIATION,
      foreignKey: 'testPlanId',
      sourceKey: 'id'
    });
  };

  return Model;
};
