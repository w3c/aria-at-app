const MODEL_NAME = 'At';

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
        allowNull: false
      }
    },
    {
      timestamps: false,
      tableName: MODEL_NAME
    }
  );

  Model.AT_VERSION_ASSOCIATION = { as: 'atVersions' };
  Model.BROWSERS_ASSOCIATION = { through: 'AtBrowsers', as: 'browsers' };
  Model.AT_MODE_ASSOCIATION = { as: 'modes' };

  Model.associate = function (models) {
    Model.hasMany(models.AtVersion, {
      ...Model.AT_VERSION_ASSOCIATION,
      foreignKey: 'atId',
      sourceKey: 'id'
    });

    Model.belongsToMany(models.Browser, {
      ...Model.BROWSERS_ASSOCIATION,
      foreignKey: 'atId',
      otherKey: 'browserId'
    });

    Model.hasMany(models.AtMode, {
      ...Model.AT_MODE_ASSOCIATION,
      foreignKey: 'atId',
      sourceKey: 'id'
    });
  };

  return Model;
};
