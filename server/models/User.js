const MODEL_NAME = 'User';

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
      username: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      createdAt: { type: DataTypes.DATE },
      updatedAt: { type: DataTypes.DATE }
    },
    {
      timestamps: true,
      tableName: MODEL_NAME
    }
  );

  Model.TESTER = 'TESTER';
  Model.ADMIN = 'ADMIN';
  Model.VENDOR = 'VENDOR';

  Model.ROLE_ASSOCIATION = { through: 'UserRoles', as: 'roles' };
  Model.ATS_ASSOCIATION = { through: 'UserAts', as: 'ats' };
  Model.TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };

  Model.associate = function (models) {
    Model.belongsToMany(models.Role, {
      ...Model.ROLE_ASSOCIATION,
      foreignKey: 'userId',
      otherKey: 'roleName'
    });

    Model.belongsToMany(models.At, {
      ...Model.ATS_ASSOCIATION,
      foreignKey: 'userId',
      otherKey: 'atId'
    });

    Model.hasMany(models.TestPlanRun, {
      ...Model.TEST_PLAN_RUN_ASSOCIATION,
      foreignKey: 'testerUserId',
      sourceKey: 'id'
    });
  };

  return Model;
};
