const testCount = require('./testCountResolver');
const gitMessage = require('./gitMessageResolver');
const directory = require('./directoryResolver');

const TestPlanVersion = {
    testCount,
    gitMessage,
    directory
};

module.exports = TestPlanVersion;
