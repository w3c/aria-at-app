'use strict';

const TABLE_NAME = 'BrowserVersion';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(transaction => {
            return Promise.all([
                queryInterface.renameTable('browser_version', TABLE_NAME, {
                    transaction
                }),
                queryInterface.removeColumn(TABLE_NAME, 'release_order', {
                    transaction
                }),
                queryInterface.addColumn(
                    TABLE_NAME,
                    'browser',
                    {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: {
                            model: 'Browser',
                            key: 'id'
                        }
                    },
                    { transaction }
                ),
                queryInterface.changeColumn(
                    TABLE_NAME,
                    'version',
                    {
                        type: Sequelize.TEXT,
                        allowNull: true
                    },
                    { transaction }
                ),
                queryInterface.removeConstraint(
                    TABLE_NAME,
                    'browser_version_browser_id_fkey',
                    { transaction }
                ),
                queryInterface.removeConstraint(
                    TABLE_NAME,
                    'browser_version_browser_id_version_key',
                    { transaction }
                ),
                queryInterface.removeColumn(TABLE_NAME, 'browser_id', {
                    transaction
                })
            ]);
        });
    },
    down: queryInterface => {}
};
