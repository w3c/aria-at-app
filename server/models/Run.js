module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
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
            timestamps: false,
            tableName: 'run'
        }
    );
};
