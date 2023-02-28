const {
    createTestId,
    createScenarioId,
    createAssertionId,
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId,
    decodeLocationOfDataId
} = require('./locationOfDataId');

describe('locationOfDataId', () => {
    it("creates ids which contain the parent's locationOfData", () => {
        const _testPlanVersionId = 1;
        const _testPlanRunId = 1;

        const testId = createTestId(_testPlanVersionId, 1);
        const scenarioId = createScenarioId(testId, 1);
        const assertionId = createAssertionId(testId, 1);
        const testResultId = createTestResultId(_testPlanRunId, testId);
        const scenarioResultId = createScenarioResultId(
            testResultId,
            scenarioId
        );
        const assertionResultId = createAssertionResultId(
            scenarioResultId,
            assertionId
        );
        const decodedTestId = decodeLocationOfDataId(testId);
        const decodedScenarioId = decodeLocationOfDataId(scenarioId);
        const decodedAssertionId = decodeLocationOfDataId(assertionId);
        const decodedTestResultId = decodeLocationOfDataId(testResultId);
        const decodedScenarioResultId =
            decodeLocationOfDataId(scenarioResultId);
        const decodedAssertionResultId =
            decodeLocationOfDataId(assertionResultId);

        expect(decodedTestId).toMatchObject({
            testPlanVersionId: _testPlanVersionId
        });
        expect(decodedScenarioId).toMatchObject({ testId });
        expect(decodedAssertionId).toMatchObject({ testId });
        expect(decodedTestResultId).toMatchObject({
            testPlanRunId: _testPlanRunId
        });
        expect(decodedScenarioResultId).toMatchObject({ testResultId });
        expect(decodedAssertionResultId).toMatchObject({ scenarioResultId });
    });
});
