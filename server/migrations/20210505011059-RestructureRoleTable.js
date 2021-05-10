'use strict';

const TABLE_NAME = 'Role';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(transaction => {
            return Promise.all([
                queryInterface.dropTable('user_to_role', { transaction }),
                queryInterface.renameTable('role', TABLE_NAME, { transaction }),
                queryInterface.removeColumn(TABLE_NAME, 'id', { transaction }),
                queryInterface.changeColumn(
                    TABLE_NAME,
                    'name',
                    {
                        type: Sequelize.TEXT,
                        primaryKey: true,
                        allowNull: false,
                        unique: true
                    },
                    { transaction }
                )
            ]);
        });
    },
    down: queryInterface => {}
};
