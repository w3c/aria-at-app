const testResultCount = testPlanRun => {
    // check for testResult objects where 'result' exists
    return testPlanRun.testResults
        ? testPlanRun.testResults.reduce(
              (acc, curr) => acc + (curr.result ? 1 : 0),
              0
          )
        : 0;
};

module.exports = testResultCount;
