const testCount = require('./testCountResolver');
const gitMessage = require('./gitMessageResolver');
const directory = require('./directoryResolver');
const testReferencePath = require('./testReferencePathResolver');

const TestPlanVersion = {
    testCount,
    gitMessage,
    directory,
    testReferencePath
};

module.exports = TestPlanVersion;
