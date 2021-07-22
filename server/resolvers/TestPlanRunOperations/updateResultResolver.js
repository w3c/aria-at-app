const {
    getTestPlanRunById,
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populatedDataResolver = require('../PopulatedData');

// this would come from the iframe result after submitting a test
const updateResultResolver = async (
    { parentContext: { id: testPlanRunId } },
    { result, index }
) => {
    const testPlanRun = await getTestPlanRunById(testPlanRunId);
    let { testResults } = testPlanRun;

    const testResultToUpdateIndex = testResults.findIndex(
        testResult => testResult.test.executionOrder === index
    );

    if (!result) {
        // if user decides to start over
        testResults[testResultToUpdateIndex].result = null;
        testResults[testResultToUpdateIndex].test.isComplete = false;
        testResults[testResultToUpdateIndex].test.completedAt = null;
    } else {
        testResults[testResultToUpdateIndex].result = {
            ...testResults[testResultToUpdateIndex].result,
            ...result
        };
        testResults[testResultToUpdateIndex].test.isComplete = true;
        testResults[testResultToUpdateIndex].test.completedAt = new Date();
    }

    await updateTestPlanRun(testPlanRunId, { testResults });

    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanRunId } }
    });
};

module.exports = updateResultResolver;
