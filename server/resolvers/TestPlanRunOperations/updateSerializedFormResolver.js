const {
    getTestPlanRunById,
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populatedDataResolver = require('../PopulatedData');

// this would come from the iframe result after moving on to another/submitting a test
const updateSerializedFormResolver = async (
    { parentContext: { id: testPlanRunId } },
    { form, index }
) => {
    const testPlanRun = await getTestPlanRunById(testPlanRunId);
    let { testResults } = testPlanRun;

    const testResultToUpdateIndex = testResults.findIndex(
        testResult => testResult.test.executionOrder === index
    );

    if (!form) {
        // if user decides to start over
        testResults[testResultToUpdateIndex].serializedForm = null;
        testResults[testResultToUpdateIndex].test.startedAt = null;
    } else {
        testResults[testResultToUpdateIndex].serializedForm = [...form];
        testResults[testResultToUpdateIndex].test.startedAt = new Date();
    }

    await updateTestPlanRun(testPlanRunId, { testResults });

    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanRunId } }
    });
};

module.exports = updateSerializedFormResolver;
