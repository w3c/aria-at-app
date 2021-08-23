const isCompleteResolver = testPlanRun => {
    if (testPlanRun.testResults) {
        for (let i = 0; i < testPlanRun.testResults.length; i++) {
            if (!testPlanRun.testResults[i].result) return false;
        }
    }

    return true;
};

module.exports = isCompleteResolver;
