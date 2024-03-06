'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface /* , Sequelize */) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.dropTable('AtMode', {
                cascade: true,
                transaction
            });
            // try {
            //     throw new Error('ERROR HERE');
            // } catch (e) {
            //     console.log(e);
            // }
        });
        /*TODO:
        
       - Delete AtMode table
       - Update the tests field on testPlanVersions to remove
          the atMode field

       */
    },

    async down(queryInterface, Sequelize) {}
};
