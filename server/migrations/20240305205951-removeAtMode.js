'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface /* , Sequelize */) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.dropTable('AtMode', {
                cascade: true,
                transaction
            });
        });
    }
};
