const { getTestResults } = require('../../models/services/TestResultService');

const testResultsResolver = async testPlanRun => getTestResults(testPlanRun);

module.exports = testResultsResolver;
