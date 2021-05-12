const MODEL_NAME = 'Role';

module.exports = function(sequelize, DataTypes) {
    const Model = sequelize.define(
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

    Model.USER_ASSOCIATION = {
        through: 'UserRoles',
        as: 'users'
    };

    Model.associate = function(models) {
        Model.belongsToMany(models.Role, {
            ...Model.USER_ASSOCIATION,
            foreignKey: 'roleName',
            otherKey: 'userId'
        });
    };

    return Model;
};
