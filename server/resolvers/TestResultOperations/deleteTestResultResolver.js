// TODO: revisit as part of reporting migration
const deleteTestResultResolver = async () => {};

module.exports = deleteTestResultResolver;

/* Previous Implementation! */

/*
const { index } = input;

const testPlanRun = await getTestPlanRunById(testPlanRunId);
let { testResults } = testPlanRun;

const testResultToUpdateIndex = testResults.findIndex(
    testResult => testResult.test.executionOrder === index
);

// if user decides to start over
if (testResults[testResultToUpdateIndex]) {
    testResults[testResultToUpdateIndex].result = null;
    testResults[testResultToUpdateIndex].state = null;

    await updateTestPlanRun(testPlanRunId, { testResults });
}

return populateData({ testPlanRunId });
*/
