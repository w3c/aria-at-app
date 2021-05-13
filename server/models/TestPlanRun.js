const MODEL_NAME = 'TestPlanRun';

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
            isManuallyTested: { type: DataTypes.BOOLEAN, default: false },
            tester: { type: DataTypes.INTEGER, allowNull: true },
            testPlanReport: { type: DataTypes.INTEGER }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.TEST_RESULT_ASSOCIATION = { as: 'testResults' };

    Model.TEST_PLAN_REPORT_ASSOCIATION = { foreignKey: 'testPlanReport' };

    Model.USER_ASSOCIATION = { foreignKey: 'tester' };

    Model.associate = function(models) {
        Model.hasMany(models.TestResult, {
            ...Model.TEST_RESULT_ASSOCIATION,
            foreignKey: 'testPlanRun',
            sourceKey: 'id'
        });

        Model.belongsTo(models.TestPlanReport, {
            ...Model.TEST_PLAN_REPORT_ASSOCIATION,
            targetKey: 'id'
        });

        Model.belongsTo(models.User, {
            ...Model.USER_ASSOCIATION,
            targetKey: 'id',
            as: 'testerObject'
        });
    };

    return Model;
};
