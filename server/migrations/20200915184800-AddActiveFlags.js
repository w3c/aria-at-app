'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn(
                    'apg_example',
                    'active',
                    {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                        allowNull: false
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'at',
                    'active',
                    {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                        allowNull: false
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'run',
                    'active',
                    {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                        allowNull: false
                    },
                    { transaction: t }
                )
            ]);
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.removeColumn('apg_example', 'active', {
                    transaction: t
                }),
                queryInterface.removeColumn('at', 'active', { transaction: t }),
                queryInterface.removeColumn('run', 'active', {
                    transaction: t
                })
            ]);
        });
    }
};
