const MODEL_NAME = 'Role';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        MODEL_NAME,
        {
            name: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );
};
