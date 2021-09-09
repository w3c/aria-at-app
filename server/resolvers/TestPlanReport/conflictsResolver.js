const { isEqual, pick } = require('lodash');
const testResultsResolver = require('../TestPlanRun/testResultsResolver');
const populateData = require('../../services/PopulatedData/populateData');

const allEqual = items => {
    for (let i = 0; i < items.length - 1; i += 1) {
        if (!isEqual(items[i], items[i + 1])) return false;
    }
    return true;
};

const conflictsResolver = async testPlanReport => {
    const conflicts = [];

    const testResultsByTestId = {};
    await Promise.all(
        testPlanReport.testPlanRuns.map(async testPlanRun => {
            // TODO: run this remapping before saving to database
            testPlanRun.testPlanReport = testPlanReport; // TODO: remove hacky fix
            const testResults = await testResultsResolver(testPlanRun);
            testResults.forEach(testResult => {
                if (!testResultsByTestId[testResult.testId]) {
                    testResultsByTestId[testResult.testId] = [];
                }
                testResultsByTestId[testResult.testId].push(testResult);
            });
        })
    );

    Object.entries(testResultsByTestId).forEach(([testId, testResults]) => {
        // See GraphQL TestPlanResultConflict for more info about how the
        // conflicts are formatted
        const conflictDetected = ({ i, j } = {}) => {
            if (j) {
                const oneScenarioResult = testResults[0].scenarioResults[i];
                const { assertionId } = oneScenarioResult.assertionResults[j];
                conflicts.push({
                    source: { assertionId },
                    conflictingResults: testResults.map(testResult => ({
                        assertionResultId:
                            testResult.scenarioResults[i].assertionResults[j].id
                    }))
                });
            } else if (i) {
                const { scenarioId } = testResults[0].scenarioResults[i];
                conflicts.push({
                    source: { scenarioId },
                    conflictingResults: testResults.map(testResult => ({
                        scenarioResultId: testResult.scenarioResults[i].id
                    }))
                });
            } else {
                conflicts.push({
                    source: { testId },
                    conflictingResults: testResults.map(testResult => ({
                        testResultId: testResult.id
                    }))
                });
            }
        };

        if (testResults.length <= 1) return; // Nothing to compare

        const testResultComparisons = testResults.map(
            testResult => testResult.scenarioResults.length
        );
        if (!allEqual(testResultComparisons)) {
            return conflictDetected();
        }

        for (let i = 0; i < testResults[0].scenarioResults.length; i += 1) {
            const scenarioResultComparisons = testResults.map(testResult => {
                return {
                    ...pick(testResult.scenarioResults[i], [
                        'output',
                        'unexpectedBehaviors'
                    ]),
                    assertionResultCount:
                        testResult.scenarioResults[i].assertionResults.length
                };
            });
            if (!allEqual(scenarioResultComparisons)) {
                return conflictDetected({ i });
            }

            for (
                let j = 0;
                j < testResults[0].scenarioResults[i].assertionResults.length;
                j += 1
            ) {
                const assertionResultComparisons = testResults.map(testResult =>
                    pick(testResult.scenarioResults[i].assertionResults[j], [
                        'passed',
                        'failedReason'
                    ])
                );
                if (!allEqual(assertionResultComparisons)) {
                    return conflictDetected({ i, j });
                }
            }
        }
    });

    const preloaded = { testPlanReport };

    return Promise.all(
        conflicts.map(async ({ source, conflictingResults }) => ({
            source: await populateData(source, { preloaded }),
            conflictingResults: await Promise.all(
                conflictingResults.map(conflictingResult =>
                    populateData(conflictingResult, { preloaded })
                )
            )
        }))
    );
};

module.exports = conflictsResolver;
