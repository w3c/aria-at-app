'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('test_issue', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            test_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'test',
                    key: 'id'
                }
            },
            run_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'run',
                    key: 'id'
                }
            },
            issue_number: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        });
    },
    down: queryInterface => {
        return queryInterface.dropTable('test_issue');
    }
};
