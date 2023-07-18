const MODEL_NAME = 'TestPlanVersion';

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
            metadata: { type: DataTypes.JSONB }
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
