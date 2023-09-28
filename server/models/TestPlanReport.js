const MODEL_NAME = 'TestPlanReport';

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
            testPlanVersionId: { type: DataTypes.INTEGER },
            testPlanId: { type: DataTypes.INTEGER },
            atId: { type: DataTypes.INTEGER },
            browserId: { type: DataTypes.INTEGER },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            vendorReviewStatus: {
                type: DataTypes.TEXT, // 'READY', 'IN_PROGRESS', 'APPROVED'
                defaultValue: null,
                allowNull: true
            },
            metrics: {
                type: DataTypes.JSONB,
                defaultValue: {},
                allowNull: false
            },
            markedFinalAt: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.TEST_PLAN_VERSION_ASSOCIATION = { foreignKey: 'testPlanVersionId' };

    Model.AT_ASSOCIATION = { foreignKey: 'atId' };

    Model.BROWSER_ASSOCIATION = { foreignKey: 'browserId' };

    Model.TEST_PLAN_ASSOCIATION = { foreignKey: 'testPlanId' };

    Model.TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };

    Model.associate = function (models) {
        Model.belongsTo(models.TestPlanVersion, {
            ...Model.TEST_PLAN_VERSION_ASSOCIATION,
            targetKey: 'id',
            as: 'testPlanVersion'
        });

        Model.belongsTo(models.At, {
            ...Model.AT_ASSOCIATION,
            targetKey: 'id',
            as: 'at'
        });

        Model.belongsTo(models.Browser, {
            ...Model.BROWSER_ASSOCIATION,
            targetKey: 'id',
            as: 'browser'
        });

        Model.belongsTo(models.TestPlan, {
            ...Model.TEST_PLAN_ASSOCIATION,
            targetKey: 'id',
            as: 'testPlan'
        });

        Model.hasMany(models.TestPlanRun, {
            ...Model.TEST_PLAN_RUN_ASSOCIATION,
            foreignKey: 'testPlanReportId',
            sourceKey: 'id'
        });
    };

    return Model;
};
