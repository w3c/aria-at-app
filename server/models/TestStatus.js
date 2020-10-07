module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'TestStatus',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: 'test_status'
        }
    );

    model.SKIPPED = 'skipped';
    model.INCOMPLETE = 'incomplete';
    model.COMPLETE = 'complete';

    return model;
};
