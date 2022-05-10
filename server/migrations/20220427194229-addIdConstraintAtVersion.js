'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addConstraint('AtVersion', ['id'], {
                type: 'primary key',
                name: 'AtVersion_pkey',
                transaction
            });
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeConstraint(
                'AtVersion',
                'AtVersion_pkey',
                { transaction }
            );
        });
    }
};
