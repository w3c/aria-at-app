'use strict';

module.exports = {
    up: async queryInterface => {
        queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeConstraint(
                'AtVersion',
                'AtVersion_pkey',
                { transaction }
            );
        });
    },

    down: async queryInterface => {
        queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addConstraint(
                'AtVersion',
                {
                    type: 'primary key',
                    name: 'AtVersion_pkey',
                    fields: ['atId', 'atVersion']
                },
                { transaction }
            );
        });
    }
};
