'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.renameColumn(
                'AtVersion',
                'atVersion',
                'name',
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.renameColumn(
                'AtVersion',
                'name',
                'atVersion',
                { transaction }
            );
        });
    }
};
