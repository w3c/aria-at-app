const { COLLECTION_JOB_STATUS } = require('../util/enums');

const MODEL_NAME = 'CollectionJobTestStatus';

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
            collectionJobId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'CollectionJob',
                    key: 'id'
                }
            },
            testId: {
                type: DataTypes.STRING,
                allowNull: null
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: COLLECTION_JOB_STATUS.QUEUED
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.associate = function (models) {
        Model.belongsTo(models.CollectionJob, {
            foreignKey: 'collectionJobId',
            targetKey: 'id',
            as: 'collectionJob',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    Model.QUEUED = COLLECTION_JOB_STATUS.QUEUED;
    Model.RUNNING = COLLECTION_JOB_STATUS.RUNNING;
    Model.COMPLETED = COLLECTION_JOB_STATUS.COMPLETED;
    Model.CANCELLED = COLLECTION_JOB_STATUS.CANCELLED;
    Model.ERROR = COLLECTION_JOB_STATUS.ERROR;

    return Model;
};
