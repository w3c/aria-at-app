module.exports = function(sequelize, DataTypes) {
    let UserToAt = sequelize.define(
        'UserToAt',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            at_name_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'at_name',
                    key: 'id'
                },
                unique: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: 'user_to_at'
        }
    );

    UserToAt.associate = function(models) {
        models.UserToAt.belongsTo(models.Users, {
            foreignKey: 'user_id',
            targetKey: 'id'
        });
        models.UserToAt.belongsTo(models.AtName, {
            foreignKey: 'at_name_id',
            targetKey: 'id'
        });
    };

    return UserToAt;
};
