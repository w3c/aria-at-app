const titleResolver = require('../TestResult/titleResolver');
const indexResolver = require('../TestResult/indexResolver');
const referenceFilePathResolver = require('../TestResult/testFilePathResolver');

const testResolver = test => ({
    ...test,
    title: titleResolver(test),
    index: indexResolver(test),
    referenceFilePath: referenceFilePathResolver(test)
});

const testsResolver = testPlanVersion => {
    return testPlanVersion.tests.map(test => ({
        ...testResolver(test)
    }));
};

module.exports = testsResolver;
