const {
  AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS
} = require('../util/constants');

const MODEL_NAME = 'AtVersion';

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
      atId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'At',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      releasedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
      },
      supportedByAutomation: {
        type: DataTypes.VIRTUAL,
        get() {
          return Model.isSupportedByAutomation(this.atId, this.name);
        }
      }
    },
    {
      timestamps: false,
      tableName: MODEL_NAME
    }
  );

  Model.AT_ASSOCIATION = { foreignKey: 'atId' };

  Model.TEST_PLAN_REPORT_ASSOCIATION = { foreignKey: 'atId' };

  Model.associate = function (models) {
    Model.belongsTo(models.At, {
      ...Model.AT_ASSOCIATION,
      targetKey: 'id',
      as: 'at'
    });
  };

  Model.isSupportedByAutomation = async function (atId, versionName) {
    const At = sequelize.models.At;
    const at = await At.findByPk(atId);
    if (!at) return false;
    const supportedVersions =
      AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS[at.name] || [];
    return supportedVersions.includes(versionName);
  };

  return Model;
};
