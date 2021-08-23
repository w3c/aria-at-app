const {
    getTestPlanRunById,
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populatedDataResolver = require('../PopulatedData');

const updateTestResultResolver = async (
    { parentContext: { id: testPlanRunId } },
    { input }
) => {
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

    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanRunId } }
    });
};

module.exports = updateTestResultResolver;
