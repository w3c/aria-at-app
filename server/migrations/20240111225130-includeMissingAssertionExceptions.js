'use strict';

const { regenerateResultsAndRecalculateHashes } = require('./utils');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const updateV2TestsToIncludeEmptyAssertionExceptions =
            async transaction => {
                const testPlanVersions = await queryInterface.sequelize.query(
                    `SELECT id, tests FROM "TestPlanVersion" WHERE metadata->>'testFormatVersion' = '2'`,
                    {
                        type: Sequelize.QueryTypes.SELECT,
                        transaction
                    }
                );
                await Promise.all(
                    testPlanVersions.map(async ({ id, tests }) => {
                        const updatedTests = JSON.stringify(
                            tests.map(test => {
                                test.assertions = test.assertions.map(
                                    assertion => ({
                                        ...assertion,
                                        assertionExceptions: []
                                    })
                                );
                                return test;
                            })
                        );
                        await queryInterface.sequelize.query(
                            `UPDATE "TestPlanVersion" SET tests = ? WHERE id = ?`,
                            { replacements: [updatedTests, id], transaction }
                        );
                    })
                );
            };

        return queryInterface.sequelize.transaction(async transaction => {
            await updateV2TestsToIncludeEmptyAssertionExceptions(transaction);

            // Recalculate the hashes
            await regenerateResultsAndRecalculateHashes(
                queryInterface,
                transaction
            );
        });
    }
};
