const runnableTestsResolver = testPlanReport => {
    const {
        testPlanTarget,
        testPlanVersion: { tests }
    } = testPlanReport;

    return tests.filter(test => test.atIds.includes(testPlanTarget.at.id));
};

module.exports = runnableTestsResolver;
