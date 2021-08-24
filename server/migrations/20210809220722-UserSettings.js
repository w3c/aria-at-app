'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('UserAts', {
            userId: { type: Sequelize.DataTypes.INTEGER },
            atId: { type: Sequelize.DataTypes.INTEGER }
        });
    },

    down: async (queryInterface /* , Sequelize */) => {
        await queryInterface.dropTable('UserAts');
    }
};
