const testResultsResolver = require('../TestPlanRun/testResultsResolver');
const deepCustomMerge = require('../../util/deepCustomMerge');

/**
 * Completed test results sourced from all the report's runs. The runs must be
 * merged because each run might have skipped different tests.
 */
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
            { identifyArrayItem: item => item.id }
        );
    }

    return testResultsResolver({ testPlanReport, testResults: merged });
};

module.exports = finalizedTestResultsResolver;
