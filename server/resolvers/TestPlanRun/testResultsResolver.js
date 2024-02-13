const {
    getTestResults
} = require('../../models/services.deprecated/TestResultReadService');

const testResultsResolver = async testPlanRun => getTestResults(testPlanRun);

module.exports = testResultsResolver;
