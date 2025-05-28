module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'UpdateEvent',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        autoIncrementIdentity: true
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(
          'COLLECTION_JOB',
          'GENERAL',
          'TEST_PLAN_RUN',
          'TEST_PLAN_REPORT'
        ),
        allowNull: false,
        defaultValue: 'GENERAL'
      }
    },
    {
      timestamps: false,
      tableName: 'UpdateEvent',
      schema: 'public'
    }
  );

  return Model;
};
