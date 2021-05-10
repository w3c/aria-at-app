'use strict';

const TABLE_NAME = 'UserRoles';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(TABLE_NAME, {
            userId: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            roleName: {
                type: Sequelize.TEXT,
                primaryKey: true
            }
        });
    },
    down: queryInterface => {
        return queryInterface.dropTable(TABLE_NAME);
    }
};
