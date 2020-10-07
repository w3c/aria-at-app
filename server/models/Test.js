module.exports = function(sequelize, DataTypes) {
    const Test = sequelize.define(
        'Test',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            file: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            execution_order: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            apg_example_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'apg_example',
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
            tableName: 'test'
        }
    );

    Test.associate = function(models) {
        models.Test.hasMany(models.TestResult, {
            foreignKey: 'test_id',
            sourceKey: 'id'
        });
    };

    return Test;
};
