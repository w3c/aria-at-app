const MODEL_NAME = 'TestPlanReport';

const STATUS = {
    DRAFT: 'draft',
    IN_REVIEW: 'in_review',
    FINAL: 'final'
};

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
            publishStatus: {
                type: DataTypes.TEXT,
                // type: DataTypes.ENUM(
                //     STATUS.DRAFT,
                //     STATUS.IN_REVIEW,
                //     STATUS.FINAL
                // ),
                allowNull: false,
                defaultValue: STATUS.DRAFT
            },
            testPlanTarget: { type: DataTypes.INTEGER },
            testPlan: { type: DataTypes.INTEGER },
            coveragePercent: { type: DataTypes.NUMERIC },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.DRAFT = STATUS.DRAFT;
    Model.IN_REVIEW = STATUS.IN_REVIEW;
    Model.FINAL = STATUS.FINAL;

    Model.TEST_PLAN_ASSOCIATION = { foreignKey: 'testPlan' };

    Model.TEST_PLAN_TARGET_ASSOCIATION = { foreignKey: 'testPlanTarget' };

    Model.TEST_PLAN_RUN_ASSOCIATION = { as: 'testPlanRuns' };

    Model.associate = function(models) {
        Model.belongsTo(models.TestPlan, {
            ...Model.TEST_PLAN_ASSOCIATION,
            targetKey: 'id',
            as: 'testPlanObject'
        });

        Model.belongsTo(models.TestPlanTarget, {
            ...Model.TEST_PLAN_TARGET_ASSOCIATION,
            targetKey: 'id',
            as: 'testPlanTargetObject'
        });

        Model.hasMany(models.TestPlanRun, {
            ...Model.TEST_PLAN_RUN_ASSOCIATION,
            foreignKey: 'testPlanReport',
            sourceKey: 'id'
        });
    };

    return Model;
};
