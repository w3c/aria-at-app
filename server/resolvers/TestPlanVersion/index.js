const testCount = require('./testCountResolver');
const gitMessage = require('./gitMessageResolver');
const directory = require('./directoryResolver');
const tests = require('./testsResolver');

const TestPlanVersion = {
    testCount,
    gitMessage,
    directory,
    tests
};

module.exports = TestPlanVersion;
