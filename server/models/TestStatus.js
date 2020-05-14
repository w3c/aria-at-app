module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
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
};
