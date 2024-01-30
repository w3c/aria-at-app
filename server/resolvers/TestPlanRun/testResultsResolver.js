const {
    getTestResults
} = require('../../models/services/TestResultReadService');

const testResultsResolver = async testPlanRun => getTestResults(testPlanRun);

module.exports = testResultsResolver;
