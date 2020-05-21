module.exports = function(sequelize, { BOOLEAN, INTEGER }) {
    return sequelize.define(
        'TestIssue',
        {
            id: {
                type: INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            test_id: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: 'test',
                    key: 'id'
                }
            },
            run_id: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: 'run',
                    key: 'id'
                }
            },
            issue_number: {
                type: INTEGER,
                allowNull: false
            }
        },
        {
            timestamps: false,
            tableName: 'test_issue'
        }
    );
};
