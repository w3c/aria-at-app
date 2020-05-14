module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        'Session',
        {
            sid: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true
            },
            sess: {
                type: DataTypes.JSON,
                allowNull: false
            },
            expire: {
                type: DataTypes.DATE,
                allowNull: false
            }
        },
        {
            timestamps: false,
            tableName: 'session'
        }
    );
};
