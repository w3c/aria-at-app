const MODEL_NAME = 'User';

module.exports = function(sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.ROLE_ASSOCIATION = {
        through: 'UserRoles',
        as: 'roles'
    };

    Model.associate = function(models) {
        Model.belongsToMany(models.Role, {
            ...Model.ROLE_ASSOCIATION,
            foreignKey: 'userId',
            otherKey: 'roleName'
        });
    };

    return Model;
};
