module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        'UserToRole',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                unique: true
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'role',
                    key: 'id'
                }
            }
        },
        {
            timestamps: false,
            tableName: 'user_to_role'
        }
    );
};
