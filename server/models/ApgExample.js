module.exports = function(sequelize, DataTypes) {
    const ApgExample = sequelize.define(
        'ApgExample',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            directory: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            test_version_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'test_version',
                    key: 'id'
                }
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            timestamps: false,
            tableName: 'apg_example'
        }
    );

    ApgExample.associate = function(models) {
        models.ApgExample.hasMany(models.Test, {
            foreignKey: 'apg_example_id',
            sourceKey: 'id'
        });
    };

    return ApgExample;
};
