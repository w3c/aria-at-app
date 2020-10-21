module.exports = function(sequelize, DataTypes) {
    const TestResult = sequelize.define(
        'TestResult',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            test_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'test',
                    key: 'id'
                }
            },
            run_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'run',
                    key: 'id'
                }
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            status_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'test_status',
                    key: 'id'
                }
            },
            result: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            serialized_form: {
                type: DataTypes.JSONB,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: 'test_result'
        }
    );

    TestResult.associate = function(models) {
        models.TestResult.belongsTo(models.TestStatus, {
            foreignKey: 'status_id',
            sourceKey: 'id'
        });
    };

    return TestResult;
};
