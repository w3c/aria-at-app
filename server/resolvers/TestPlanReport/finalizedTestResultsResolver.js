const testResultsResolver = require('../TestPlanRun/testResultsResolver');
const deepCustomMerge = require('../../util/deepCustomMerge');

const finalizedTestResultsResolver = testPlanReport => {
    if (
        testPlanReport.status !== 'FINALIZED' ||
        !testPlanReport.testPlanRuns.length
    ) {
        return null;
    }

    let merged = [];

    for (let i = 0; i < testPlanReport.testPlanRuns.length; i += 1) {
        merged = deepCustomMerge(
            merged,
            testPlanReport.testPlanRuns[i].testResults.filter(
                testResult => !!testResult.completedAt
            ),
            {
                identifyArrayItem: each =>
                    each.testId ?? each.scenarioId ?? each.assertionId
            }
        );
    }

    return testResultsResolver({ testPlanReport, testResults: merged });
};

module.exports = finalizedTestResultsResolver;
