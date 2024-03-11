'use strict';

const { regenerateResultsAndRecalculateHashes } = require('./utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
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
                                    id: assertion.id,
                                    assertionId:
                                        test.renderableContent.assertions.find(
                                            otherAssertion =>
                                                otherAssertion.assertionStatement ===
                                                assertion.assertionStatement
                                        ).assertionId,
                                    ...assertion
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

            await regenerateResultsAndRecalculateHashes(
                queryInterface,
                transaction,
                { pruneOldVersions: false }
            );
        });
    }
};
