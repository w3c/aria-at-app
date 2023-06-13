const testPlan = require('./testPlanResolver');
const gitMessage = require('./gitMessageResolver');
const tests = require('./testsResolver');
const testPlanReports = require('./testPlanReportsResolver');

const TestPlanVersion = {
    testPlan,
    gitMessage,
    tests,
    testPlanReports
};

module.exports = TestPlanVersion;
