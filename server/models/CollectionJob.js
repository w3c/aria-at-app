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
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.QUEUED = STATUS.QUEUED;
    Model.RUNNING = STATUS.RUNNING;
    Model.COMPLETED = STATUS.COMPLETED;
    Model.FAILED = STATUS.FAILED;

    return Model;
};
