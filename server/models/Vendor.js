const MODEL_NAME = 'Vendor';

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
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      }
    },
    {
      timestamps: true,
      tableName: MODEL_NAME
    }
  );

  Model.AT_ASSOCIATION = { as: 'ats' };
  Model.USER_ASSOCIATION = { as: 'users' };

  Model.associate = function (models) {
    Model.hasMany(models.At, {
      as: 'ats',
      foreignKey: 'vendorId',
      sourceKey: 'id'
    });

    Model.hasMany(models.User, {
      ...Model.USER_ASSOCIATION,
      foreignKey: 'vendorId',
      sourceKey: 'id'
    });
  };

  return Model;
};
