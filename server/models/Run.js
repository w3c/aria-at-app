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
            test_cycle_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'test_cycle',
                    key: 'id'
                }
            },
            at_version_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'at_version',
                    key: 'id'
                }
            },
            at_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'at',
                    key: 'id'
                }
            },
            browser_version_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'browser_version',
                    key: 'id'
                }
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
            }
        },
        {
            tableName: 'run'
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
    };

    return Run;
};
