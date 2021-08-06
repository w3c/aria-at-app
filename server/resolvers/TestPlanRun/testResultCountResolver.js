const testResultCount = testPlanRun => {
    return testPlanRun.testResults ? testPlanRun.testResults.length : 0;
};

module.exports = testResultCount;
