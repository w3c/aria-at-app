const MODEL_NAME = 'User';

module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define(
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

    User.associate = function(models) {
        User.belongsToMany(models.Role, {
            through: 'UserRoles',
            as: 'roles'
        });
    };

    return User;
};
