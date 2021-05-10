'use strict';

const TABLE_NAME = 'AtVersion';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(transaction => {
            return Promise.all([
                queryInterface.renameTable('at_version', TABLE_NAME, {
                    transaction
                }),
                queryInterface.removeColumn(TABLE_NAME, 'release_order', {
                    transaction
                }),
                queryInterface.addColumn(
                    TABLE_NAME,
                    'at',
                    {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: {
                            model: 'At',
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
                    'at_version_at_name_id_version_key',
                    { transaction }
                ),
                queryInterface.removeColumn(TABLE_NAME, 'at_name_id', {
                    transaction
                })
            ]);
        });
    },
    down: queryInterface => {}
};
