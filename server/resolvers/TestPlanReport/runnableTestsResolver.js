const testsResolver = require('../TestPlanVersion/testsResolver');

const runnableTestsResolver = testPlanReport => {
    const { testPlanTarget } = testPlanReport;

    const tests = testsResolver(testPlanReport);

    return tests.filter(test => test.atIds.includes(testPlanTarget.at.id));
};

module.exports = runnableTestsResolver;
