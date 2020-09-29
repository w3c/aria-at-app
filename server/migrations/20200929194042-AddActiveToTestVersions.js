'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn(
                    'test_version',
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
                queryInterface.removeColumn('test_version', 'active', {
                    transaction: t
                })
            ]);
        });
    }
};
