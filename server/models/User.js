const MODEL_NAME = 'User';

module.exports = function(sequelize, DataTypes) {
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

    Model.ROLE_ASSOCIATION = { through: 'UserRoles', as: 'roles' };

    Model.TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };

    Model.associate = function(models) {
        Model.belongsToMany(models.Role, {
            ...Model.ROLE_ASSOCIATION,
            foreignKey: 'userId',
            otherKey: 'roleName'
        });

        Model.hasMany(models.TestPlanRun, {
            ...Model.TEST_PLAN_RUN_ASSOCIATION,
            foreignKey: 'tester',
            sourceKey: 'id'
        });
    };

    return Model;
};
