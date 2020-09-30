'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn(
                    'run',
                    'browser_version_to_at_and_at_versions_id',
                    {
                        type: Sequelize.INTEGER,
                        references: {
                            model: 'BrowserVersionToAtAndAtVersions',
                            key: 'id'
                        }
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'run',
                    'test_version_id',
                    {
                        type: Sequelize.INTEGER
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'run',
                    'created_at',
                    {
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.NOW
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'run',
                    'updated_at',
                    {
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.NOW
                    },
                    { transaction: t }
                )
            ]);
        });
    },
    down: queryInterface => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.removeColumn(
                    'run',
                    'browser_version_to_at_and_at_versions_id',
                    {
                        transaction: t
                    }
                ),
                queryInterface.removeColumn('run', 'test_version_id', {
                    transaction: t
                }),
                queryInterface.removeColumn('run', 'created_at', {
                    transaction: t
                }),
                queryInterface.removeColumn('run', 'updated_at', {
                    transaction: t
                })
            ]);
        });
    }
};
