const testsResolver = require('../TestPlanVersion/testsResolver');

const runnableTestsResolver = (testPlanReport, _, context) => {
    const tests = testsResolver(testPlanReport, null, context);

    return tests.filter(test => test.atIds.includes(testPlanReport.at.id));
};

module.exports = runnableTestsResolver;
