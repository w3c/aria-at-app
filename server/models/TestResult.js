const MODEL_NAME = 'TestResult';

module.exports = function(sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            startedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            completedAt: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            },
            testPlanRun: { type: DataTypes.INTEGER },
            data: { type: DataTypes.JSONB }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.TEST_PLAN_RUN_ASSOCIATION = { foreignKey: 'testPlanRun' };

    Model.associate = function(models) {
        Model.belongsTo(models.TestPlanRun, {
            ...Model.TEST_PLAN_RUN_ASSOCIATION,
            targetKey: 'id'
        });
    };

    Model.removeAttribute('id'); // stop automatic primary key (id) creation; not needed for this table

    return Model;
};
