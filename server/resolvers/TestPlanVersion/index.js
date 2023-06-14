const testPlan = require('./testPlanResolver');
const gitMessage = require('./gitMessageResolver');
const tests = require('./testsResolver');
const testPlanReports = require('./testPlanReportsResolver');
const recommendedStatusTargetDate = require('./recommendedStatusTargetDateResolver');

const TestPlanVersion = {
    testPlan,
    gitMessage,
    tests,
    testPlanReports,
    recommendedStatusTargetDate
};

module.exports = TestPlanVersion;
