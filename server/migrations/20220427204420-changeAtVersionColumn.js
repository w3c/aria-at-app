'use strict';

module.exports = {
    up: async queryInterface => {
        queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.sequelize.query(
                'ALTER TABLE public."AtVersion" RENAME COLUMN "atVersion" TO "name";',
                { transaction }
            );
        });
    },

    down: async queryInterface => {
        queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.sequelize.query(
                'ALTER TABLE public."AtVersion" RENAME COLUMN "name" TO "atVersion";',
                { transaction }
            );
        });
    }
};
