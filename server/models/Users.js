/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    let Users = sequelize.define(
        'Users',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            fullname: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            username: {
                type: DataTypes.TEXT,
                allowNull: true,
                unique: true
            },
            email: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: 'users'
        }
    );

    Users.associate = function(models) {
        models.Users.belongsToMany(models.Role, {
            through: 'user_to_role',
            timestamps: false,
            foreignKey: {
                name: 'user_id'
            },
            otherKey: {
                name: 'role_id'
            }
        });
        models.Users.belongsToMany(models.Run, {
            through: 'tester_to_run',
            timestamps: false,
            foreignKey: {
                name: 'user_id'
            },
            otherKey: {
                name: 'run_id'
            }
        });
    };
    return Users;
};
