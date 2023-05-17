const MODEL_NAME = 'TestPlanReport';
const STATUS = {
    DRAFT: 'DRAFT',
    CANDIDATE: 'CANDIDATE',
    RECOMMENDED: 'RECOMMENDED'
};

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
            status: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: STATUS.DRAFT
            },
            testPlanVersionId: { type: DataTypes.INTEGER },
            atId: { type: DataTypes.INTEGER },
            browserId: { type: DataTypes.INTEGER },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            candidateStatusReachedAt: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            },
            recommendedStatusReachedAt: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            },
            recommendedStatusTargetDate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
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
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.DRAFT = STATUS.DRAFT;
    Model.CANDIDATE = STATUS.CANDIDATE;
    Model.RECOMMENDED = STATUS.RECOMMENDED;

    Model.TEST_PLAN_VERSION_ASSOCIATION = { foreignKey: 'testPlanVersionId' };

    Model.AT_ASSOCIATION = { foreignKey: 'atId' };

    Model.BROWSER_ASSOCIATION = { foreignKey: 'browserId' };

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

        Model.hasMany(models.TestPlanRun, {
            ...Model.TEST_PLAN_RUN_ASSOCIATION,
            foreignKey: 'testPlanReportId',
            sourceKey: 'id'
        });
    };

    return Model;
};
