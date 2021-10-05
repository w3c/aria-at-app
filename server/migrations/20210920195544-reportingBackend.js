'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanVersion',
                'directory',
                Sequelize.DataTypes.TEXT,
                { transaction }
            );
            await queryInterface.removeColumn('TestPlanVersion', 'status', {
                transaction
            });
            await queryInterface.renameColumn(
                'TestPlanVersion',
                'exampleUrl',
                'testPageUrl',
                { transaction }
            );
            // Delete existing data!
            const options = {
                transaction,
                truncate: true,
                restartIdentity: true,
                cascade: true
            };
            await queryInterface.bulkDelete('AtVersion', {}, options);
            await queryInterface.bulkDelete('BrowserVersion', {}, options);
            await queryInterface.bulkDelete('TestPlanRun', {}, options);
            await queryInterface.bulkDelete('TestPlanTarget', {}, options);
            await queryInterface.bulkDelete('TestPlanVersion', {}, options);
            await queryInterface.bulkDelete('TestPlanReport', {}, options);
        });
    }
};
