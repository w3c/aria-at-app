'use strict';

const TABLE_NAME = 'Browser';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(transaction => {
            return Promise.all([
                queryInterface.dropTable('browser_version_to_at_version', {
                    transaction
                }),

                queryInterface.renameTable('browser', TABLE_NAME, {
                    transaction
                }),
                queryInterface.removeConstraint(
                    TABLE_NAME,
                    'browser_name_key',
                    { transaction }
                )
            ]);
        });
    },
    down: queryInterface => {}
};
