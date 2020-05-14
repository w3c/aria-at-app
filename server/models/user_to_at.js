/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
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
};
