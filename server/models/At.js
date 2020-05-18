module.exports = function(sequelize, DataTypes) {
    let At = sequelize.define(
        'At',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            key: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            at_name_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'at_name',
                    key: 'id'
                }
            },
            test_version_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'test_version',
                    key: 'id'
                }
            }
        },
        {
            timestamps: false,
            tableName: 'at'
        }
    );

    At.associate = function(models) {
        models.At.belongsTo(models.AtName, {
            foreignKey: 'at_name_id',
            targetKey: 'id'
        });
    };

    return At;
};
