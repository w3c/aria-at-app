const { COLLECTION_JOB_STATUS } = require('../util/enums');

const MODEL_NAME = 'CollectionJob';

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
                defaultValue: COLLECTION_JOB_STATUS.QUEUED
            },
            externalLogsUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
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

    Model.QUEUED = COLLECTION_JOB_STATUS.QUEUED;
    Model.RUNNING = COLLECTION_JOB_STATUS.RUNNING;
    Model.COMPLETED = COLLECTION_JOB_STATUS.COMPLETED;
    Model.CANCELLED = COLLECTION_JOB_STATUS.CANCELLED;
    Model.ERROR = COLLECTION_JOB_STATUS.ERROR;

    return Model;
};
