const MODEL_NAME = 'UpdateEvent';

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
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'GENERAL'
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

  return Model;
};
