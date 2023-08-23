'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('CollectionJob', {
            id: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'QUEUED'
            }
        });
    },
    down: queryInterface => {
        return queryInterface.dropTable('CollectionJob');
    }
};
