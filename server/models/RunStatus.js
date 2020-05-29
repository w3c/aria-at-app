module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
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
};
