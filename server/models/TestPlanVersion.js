const MODEL_NAME = 'TestPlanVersion';
const PHASE = {
    RD: 'RD',
    DRAFT: 'DRAFT',
    CANDIDATE: 'CANDIDATE',
    RECOMMENDED: 'RECOMMENDED',
    DEPRECATED: 'DEPRECATED'
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
            phase: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: PHASE.RD
            },
            title: { type: DataTypes.TEXT },
            directory: { type: DataTypes.TEXT },
            gitSha: { type: DataTypes.TEXT },
            gitMessage: { type: DataTypes.TEXT },
            testPageUrl: { type: DataTypes.TEXT },
            hashedTests: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            tests: { type: DataTypes.JSONB },
            testPlanId: { type: DataTypes.INTEGER },
            metadata: { type: DataTypes.JSONB },
            draftPhaseReachedAt: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            },
            candidatePhaseReachedAt: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            },
            recommendedPhaseReachedAt: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            },
            recommendedPhaseTargetDate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            },
            deprecatedAt: {
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

    Model.TEST_PLAN_REPORT_ASSOCIATION = { as: 'testPlanReports' };

    Model.TEST_PLAN_ASSOCIATION = { foreignKey: 'testPlanId' };

    Model.associate = function (models) {
        Model.hasMany(models.TestPlanReport, {
            ...Model.TEST_PLAN_REPORT_ASSOCIATION,
            foreignKey: 'testPlanVersionId',
            sourceKey: 'id'
        });

        Model.belongsTo(models.TestPlan, {
            ...Model.TEST_PLAN_ASSOCIATION,
            targetKey: 'id',
            as: 'testPlan'
        });
    };

    return Model;
};
