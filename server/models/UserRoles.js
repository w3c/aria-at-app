const MODEL_NAME = 'UserRoles';

module.exports = function(sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'User',
                    key: 'id'
                },
                unique: true
            },
            roleName: {
                type: DataTypes.TEXT,
                allowNull: false,
                references: {
                    model: 'Role',
                    key: 'name'
                }
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.associate = function(models) {};

    return Model;
};
