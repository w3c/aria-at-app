module.exports = function(sequelize, DataTypes) {
    const Run = sequelize.define(
        'Run',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
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
                references: {
                    model: 'test_version',
                    key: 'id'
                }
            },
            browser_version_to_at_versions_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'browser_version_to_at_version',
                    key: 'id'
                }
            },
            run_status_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'run_status',
                    key: 'id'
                }
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: sequelize.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: sequelize.NOW
            }
        },
        {
            tableName: 'run',
            underscored: true
        }
    );

    Run.associate = function(models) {
        models.Run.belongsTo(models.RunStatus, {
            foreignKey: 'run_status_id',
            targetKey: 'id'
        });
        models.Run.belongsTo(models.ApgExample, {
            foreignKey: 'apg_example_id',
            targetKey: 'id'
        });
        models.Run.belongsTo(models.BrowserVersionToAtVersion, {
            foreignKey: 'browser_version_to_at_versions_id',
            targetKey: 'id'
        });
        models.Run.belongsToMany(models.Users, {
            through: 'tester_to_run',
            timestamps: false,
            foreignKey: {
                name: 'run_id'
            },
            otherKey: {
                name: 'user_id'
            }
        });
        models.Run.belongsToMany(models.Test, {
            through: 'apg_example',
            scope: { method: 'byRun' }
        });
    };

    return Run;
};
