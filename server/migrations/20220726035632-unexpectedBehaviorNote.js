const { omit } = require('lodash');
const { TestPlanRun } = require('../models');

module.exports = {
    up: async () => {
        const testPlanRuns = await TestPlanRun.findAll();
        await Promise.all(
            testPlanRuns.map(testPlanRun => {
                const newTestResults = testPlanRun.testResults.map(
                    testResult => ({
                        ...testResult,
                        scenarioResults: testResult.scenarioResults.map(
                            scenarioResult => {
                                const note = scenarioResult.unexpectedBehaviors.find(
                                    each => !!each.otherUnexpectedBehaviorText
                                )?.otherUnexpectedBehaviorText;
                                return {
                                    ...scenarioResult,
                                    unexpectedBehaviors: scenarioResult.unexpectedBehaviors.map(
                                        unexpectedBehavior =>
                                            omit(unexpectedBehavior, [
                                                'otherUnexpectedBehaviorText'
                                            ])
                                    ),
                                    unexpectedBehaviorNote: note ?? null
                                };
                            }
                        )
                    })
                );
                testPlanRun.testResults = newTestResults;
                return testPlanRun.save();
            })
        );
    },

    down: async () => {
        const testPlanRuns = await TestPlanRun.findAll();
        await Promise.all(
            testPlanRuns.map(testPlanRun => {
                const newTestResults = testPlanRun.testResults.map(
                    testResult => ({
                        ...testResult,
                        scenarioResults: testResult.scenarioResults.map(
                            scenarioResult => {
                                return omit(
                                    {
                                        ...scenarioResult,
                                        unexpectedBehaviors: scenarioResult.unexpectedBehaviors.map(
                                            unexpectedBehavior => {
                                                return unexpectedBehavior.id !==
                                                    'OTHER'
                                                    ? unexpectedBehavior
                                                    : {
                                                          id: 'OTHER',
                                                          otherUnexpectedBehaviorText:
                                                              scenarioResult.unexpectedBehaviorNote
                                                      };
                                            }
                                        )
                                    },
                                    ['unexpectedBehaviorNote']
                                );
                            }
                        )
                    })
                );
                testPlanRun.testResults = newTestResults;
                return testPlanRun.save();
            })
        );
    }
};
