'use strict';

const TABLE_NAME = 'AtMode';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(TABLE_NAME, {
            at: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'At',
                    key: 'id'
                }
            },
            name: {
                type: Sequelize.TEXT,
                allowNull: false
            }
        });
    },
    down: queryInterface => {}
};
