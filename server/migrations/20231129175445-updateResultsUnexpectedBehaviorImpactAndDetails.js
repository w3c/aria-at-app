'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            const [testPlanRuns] = await queryInterface.sequelize.query(
                `select id, "testResults" from "TestPlanRun"`,
                {
                    transaction
                }
            );

            for (let testPlanRun of testPlanRuns) {
                let needsUpdate = false;
                let testResultsToUpdate = [];

                for (let testResult of testPlanRun.testResults) {
                    for (let scenarioResult of testResult.scenarioResults) {
                        if (scenarioResult.unexpectedBehaviors) {
                            for (let unexpectedBehavior of scenarioResult.unexpectedBehaviors) {
                                // Will only apply if unexpectedBehavior.id = OTHER
                                if (
                                    unexpectedBehavior.otherUnexpectedBehaviorText
                                )
                                    unexpectedBehavior.details =
                                        unexpectedBehavior.otherUnexpectedBehaviorText;

                                // Default impact to Moderate
                                if (!unexpectedBehavior.impact)
                                    unexpectedBehavior.impact = 'MODERATE';

                                // Default the text to N/A. Text content is required
                                if (!unexpectedBehavior.details)
                                    unexpectedBehavior.details = 'N/A';

                                delete unexpectedBehavior.otherUnexpectedBehaviorText;
                            }
                            needsUpdate = true;
                        }
                    }

                    testResultsToUpdate.push(testResult);
                }

                if (needsUpdate) {
                    await queryInterface.sequelize.query(
                        `update "TestPlanRun" set "testResults" = ? where id = ?`,
                        {
                            replacements: [
                                JSON.stringify(testResultsToUpdate),
                                testPlanRun.id
                            ],
                            transaction
                        }
                    );
                }
            }
        });
    }
};
