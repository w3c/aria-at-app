const MODEL_NAME = 'Audit';

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
      eventType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      performedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // Primary entity involved in the event (e.g., testPlanReportId for most events)
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      // Additional metadata for the event
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: false,
      tableName: MODEL_NAME
    }
  );

  Model.PERFORMED_BY_USER_ASSOCIATION = { foreignKey: 'performedByUserId' };

  Model.associate = function (models) {
    Model.belongsTo(models.User, {
      ...Model.PERFORMED_BY_USER_ASSOCIATION,
      targetKey: 'id',
      as: 'performedBy'
    });
  };

  return Model;
};
