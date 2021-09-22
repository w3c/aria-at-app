const testsResolver = require('../TestPlanVersion/testsResolver');

const runnableTestsResolver = testPlanReport => {
    const { testPlanTarget, testPlanVersion } = testPlanReport;

    const tests = testsResolver(testPlanVersion);

    return tests.filter(test => test.atIds.includes(testPlanTarget.at.id));
};

module.exports = runnableTestsResolver;
