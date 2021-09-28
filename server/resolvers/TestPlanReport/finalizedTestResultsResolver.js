const deepCustomMerge = require('../../util/deepCustomMerge');
const testResultsResolver = require('../TestPlanRun/testResultsResolver');

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
            testPlanReport.testPlanRuns[i].testResults,
            {
                identifyArrayItem: item => item.id
            }
        );
    }

    return testResultsResolver({ testPlanReport, testResults: merged });
};

module.exports = finalizedTestResultsResolver;
