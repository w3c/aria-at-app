'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.addColumn(
                    'apg_example',
                    'example',
                    { type: Sequelize.TEXT },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'apg_example',
                    'design_pattern',
                    { type: Sequelize.TEXT },
                    { transaction: t }
                ),
            ]);
        });
    },

    down: (queryInterface) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.removeColumn('apg_example', 'example', {
                    transaction: t,
                }),
                queryInterface.removeColumn('apg_example', 'design_pattern', {
                    transaction: t,
                }),
            ]);
        });
    },
};
