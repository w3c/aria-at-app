const testCount = require('./testCountResolver');
const gitMessage = require('./gitMessageResolver');

const TestPlanVersion = {
    testCount,
    gitMessage,
};

module.exports = TestPlanVersion;
