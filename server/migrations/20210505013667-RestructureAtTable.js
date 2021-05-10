'use strict';

const TABLE_NAME = 'At';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(transaction => {
            return Promise.all([
                queryInterface.dropTable('user_to_at', { transaction }),
                queryInterface.dropTable('test_to_at', { transaction }),
                queryInterface.removeConstraint(
                    'run',
                    'run_browser_version_to_at_versions_id_fkey',
                    { transaction }
                ),
                queryInterface.removeConstraint(
                    'browser_version_to_at_version',
                    'browser_version_to_at_version_pkey',
                    { transaction }
                ),
                queryInterface.removeConstraint(
                    'at_version',
                    'at_version_at_name_id_fkey',
                    { transaction }
                ),
                queryInterface.removeConstraint(
                    'browser_version_to_at_version',
                    'browser_version_to_at_version_at_version_id_fkey',
                    { transaction }
                ),
                queryInterface.removeConstraint(
                    'at_version',
                    'at_version_pkey',
                    { transaction }
                ),
                queryInterface.removeColumn('at_version', 'id', {
                    transaction
                }),
                queryInterface.removeConstraint('at', 'at_at_name_id_fkey', {
                    transaction
                }),
                queryInterface.dropTable('at_name', { transaction }),

                // At table related modifications
                queryInterface.renameTable('at', TABLE_NAME, { transaction }),
                queryInterface.renameColumn(TABLE_NAME, 'key', 'name', {
                    transaction
                }),
                queryInterface.removeColumn(TABLE_NAME, 'at_name_id', {
                    transaction
                }),
                queryInterface.removeColumn(TABLE_NAME, 'test_version_id', {
                    transaction
                }),
                queryInterface.removeColumn(TABLE_NAME, 'active', {
                    transaction
                })
            ]);
        });
    },
    down: queryInterface => {}
};
