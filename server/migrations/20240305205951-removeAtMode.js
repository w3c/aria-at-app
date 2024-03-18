'use strict';

const { regenerateResultsAndRecalculateHashes } = require('./utils');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.dropTable('AtMode', {
                cascade: true,
                transaction
            });

            const testPlanVersions = await queryInterface.sequelize.query(
                `SELECT id, tests FROM "TestPlanVersion"`,
                {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction
                }
            );
            await Promise.all(
                testPlanVersions.map(async ({ id, tests }) => {
                    const updatedTests = JSON.stringify(
                        tests.map(test => {
                            delete test.atMode;
                            return test;
                        })
                    );
                    await queryInterface.sequelize.query(
                        `UPDATE "TestPlanVersion" SET tests = ? WHERE id = ?`,
                        { replacements: [updatedTests, id], transaction }
                    );
                })
            );
            await regenerateResultsAndRecalculateHashes(
                queryInterface,
                transaction,
                { pruneOldVersions: false }
            );
        });
    }
};
