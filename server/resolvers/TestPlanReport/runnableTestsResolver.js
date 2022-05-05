const testsResolver = require('../TestPlanVersion/testsResolver');

const runnableTestsResolver = testPlanReport => {
    const tests = testsResolver(testPlanReport);

    return tests.filter(test => test.atIds.includes(testPlanReport.at.id));
};

module.exports = runnableTestsResolver;
