const gitMessage = require('./gitMessageResolver');
const tests = require('./testsResolver');

const TestPlanVersion = {
    gitMessage,
    tests
};

module.exports = TestPlanVersion;
