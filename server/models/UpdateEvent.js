// TODO: Rename to 'Event'
const MODEL_NAME = 'UpdateEvent';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    MODEL_NAME,
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
        type: DataTypes.STRING,
        allowNull: false,
        // Defined in server/util/eventTypes.js
        defaultValue: 'GENERAL'
      },
      performedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
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
