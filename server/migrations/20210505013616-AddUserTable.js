'use strict';

const TABLE_NAME = 'User';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(TABLE_NAME, {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: Sequelize.TEXT,
                allowNull: false,
                unique: true
            }
        });
    },
    down: queryInterface => {
        return queryInterface.dropTable(TABLE_NAME);
    }
};
