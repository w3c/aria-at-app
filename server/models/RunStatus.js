const RunStatus = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'RunStatus',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        },
        {
            timestamps: false,
            tableName: 'run_status'
        }
    );

    model.RAW = 'raw';
    model.DRAFT = 'draft';
    model.FINAL = 'final';

    return model;
};

module.exports = RunStatus;
