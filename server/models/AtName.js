module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        'AtName',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: true,
                unique: true
            }
        },
        {
            timestamps: false,
            tableName: 'at_name'
        }
    );
};
