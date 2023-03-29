const { pick } = require('lodash');
const testResultsResolver = require('../TestPlanRun/testResultsResolver');
const populateData = require('../../services/PopulatedData/populateData');
const allEqual = require('../../util/allEqual');

const conflictsResolver = async testPlanReport => {
    let testPlanReportData = {};

    // Used in cases where the testPlanRuns to evaluate the conflicts doesn't
    // exist for `testPlanReport`, such as this function being called from
    // `conflictsLengthResolver.js`
    if (testPlanReport.testPlanRuns.some(t => !t.testResults)) {
        const { testPlanReport: _testPlanReport } = await populateData({
            testPlanReportId: testPlanReport.id
        });
        testPlanReportData = _testPlanReport;
    } else testPlanReportData = testPlanReport;

    const conflicts = [];

    const testResultsByTestId = {};
    testPlanReportData.testPlanRuns.forEach(testPlanRun => {
        testPlanRun.testPlanReport = testPlanReportData; // TODO: remove hacky fix
        const testResults = testResultsResolver(testPlanRun);
        testResults
            .filter(testResult => testResult.completedAt)
            .forEach(testResult => {
                if (!testResultsByTestId[testResult.testId]) {
                    testResultsByTestId[testResult.testId] = [];
                }
                testResultsByTestId[testResult.testId].push(testResult);
            });
    });

    Object.values(testResultsByTestId).forEach(testResults => {
        // See GraphQL TestPlanResultConflict for more info about how the
        // conflicts are formatted
        const conflictDetected = ({ i, j }) => {
            if (j != null) {
                const oneScenarioResult = testResults[0].scenarioResults[i];
                const { scenarioId, assertionResults } = oneScenarioResult;
                const { assertionId } = assertionResults[j];
                conflicts.push({
                    source: { scenarioId, assertionId },
                    conflictingResults: testResults.map(testResult => ({
                        assertionResultId:
                            testResult.scenarioResults[i].assertionResults[j].id
                    }))
                });
            } else {
                const { scenarioId } = testResults[0].scenarioResults[i];
                conflicts.push({
                    source: { scenarioId },
                    conflictingResults: testResults.map(testResult => ({
                        scenarioResultId: testResult.scenarioResults[i].id
                    }))
                });
            }
        };

        if (testResults.length <= 1) return; // Nothing to compare

        for (let i = 0; i < testResults[0].scenarioResults.length; i += 1) {
            const scenarioResultComparisons = testResults.map(testResult => {
                // Note that the output and unexpectedBehaviorNote are not
                // considered
                return pick(testResult.scenarioResults[i], [
                    'unexpectedBehaviors'
                ]);
            });
            if (!allEqual(scenarioResultComparisons)) {
                conflictDetected({ i });
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
                    conflictDetected({ i, j });
                }
            }
        }
    });

    const preloaded = { testPlanReport: testPlanReportData };

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
