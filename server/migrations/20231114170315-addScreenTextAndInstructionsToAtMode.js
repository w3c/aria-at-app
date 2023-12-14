'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'AtMode',
                'screenText',
                { type: Sequelize.DataTypes.TEXT },
                { transaction }
            );

            await queryInterface.addColumn(
                'AtMode',
                'instructions',
                { type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.TEXT) },
                { transaction }
            );
        });
    },

    async down(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('AtMode', 'screenText', {
                transaction
            });

            await queryInterface.removeColumn('AtMode', 'instructions', {
                transaction
            });
        });
    }
};
