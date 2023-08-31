const MODEL_NAME = 'CollectionJob';
const STATUS = {
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

module.exports = function (sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: STATUS.QUEUED
            },
            testPlanRunId: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'TestPlanRun',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                allowNull: true,
                unique: true
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.associate = function (models) {
        Model.hasOne(models.TestPlanRun, {
            foreignKey: 'id',
            sourceKey: 'testPlanRunId',
            as: 'testPlanRun'
        });
    };

    Model.QUEUED = STATUS.QUEUED;
    Model.RUNNING = STATUS.RUNNING;
    Model.COMPLETED = STATUS.COMPLETED;
    Model.FAILED = STATUS.FAILED;

    return Model;
};
