'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('CollectionJob', {
            id: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'QUEUED'
            },
            testPlanRunId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'TestPlanRun',
                    key: 'id'
                },
                allowNull: true,
                unique: true
            }
        });
    },
    down: async queryInterface => {
        return queryInterface.dropTable('CollectionJob');
    }
};
