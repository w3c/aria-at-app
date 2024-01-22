const MODEL_NAME = 'TestPlanRun';

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
            testerUserId: { type: DataTypes.INTEGER, allowNull: true },
            testPlanReportId: { type: DataTypes.INTEGER },
            testResults: { type: DataTypes.JSONB },
            initiatedByAutomation: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.TEST_RESULT_ASSOCIATION = { as: 'testResults' };

    Model.TEST_PLAN_REPORT_ASSOCIATION = { foreignKey: 'testPlanReportId' };

    Model.USER_ASSOCIATION = { foreignKey: 'testerUserId' };

    Model.associate = function (models) {
        Model.belongsTo(models.TestPlanReport, {
            ...Model.TEST_PLAN_REPORT_ASSOCIATION,
            targetKey: 'id',
            as: 'testPlanReport'
        });

        Model.belongsTo(models.User, {
            ...Model.USER_ASSOCIATION,
            targetKey: 'id',
            as: 'tester'
        });
    };

    return Model;
};
