const {
    getTestPlanRunById,
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const updateTestResultResolver = async (
    { parentContext: { id: testPlanRunId } },
    { input }
) => {
    const { index, test, result, state, issues = [] } = input;

    const testResultInput = {
        test,
        result,
        state,
        issues
    };

    const testPlanRun = await getTestPlanRunById(testPlanRunId);
    let { testResults } = testPlanRun;

    // newly created TestPlanRun
    if (!testResults) testResults = [];

    let resultToUpdateIndex = testResults.findIndex(
        testResult => testResult.test.executionOrder === index
    );

    if (resultToUpdateIndex < 0) {
        // 'test' object MUST exist if 'testResults' are null during first run
        if (!test) throw new Error("No 'test' object provided");

        resultToUpdateIndex = testResults.length;
        testResults[resultToUpdateIndex] = testResultInput;
    }

    // comes from the iframe result after submitting a test
    if (result !== undefined) testResults[resultToUpdateIndex].result = result;

    // when someone submits or skips the current test plan results
    if (state !== undefined) testResults[resultToUpdateIndex].state = state;

    // represents GitHub Issue numbers
    if (issues.length)
        testResults[resultToUpdateIndex].issues = [
            ...(testResults[resultToUpdateIndex].issues || []),
            ...issues
        ];

    await updateTestPlanRun(testPlanRunId, { testResults });

    return populateData({ testPlanRunId });
};

module.exports = updateTestResultResolver;
