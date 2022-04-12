'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'AtVersion',
                'availability',
                { type: Sequelize.DataTypes.DATE },
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('AtVersion', 'availability', {
                transaction
            });
        });
    }
};
