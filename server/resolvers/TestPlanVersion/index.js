const testPlan = require('./testPlanResolver');
const gitMessage = require('./gitMessageResolver');
const tests = require('./testsResolver');

const TestPlanVersion = {
    testPlan,
    gitMessage,
    tests
};

module.exports = TestPlanVersion;
