const {
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId
} = require('../../services/PopulatedData/locationOfDataId');

const createTestResultSkeleton = ({ test, testPlanRun, testPlanTarget }) => {
    const testResultId = createTestResultId(testPlanRun.id, test.id);
    return {
        id: testResultId,
        testId: test.id,
        startedAt: new Date(),
        scenarioResults: test.scenarios
            .filter(each => each.atId === testPlanTarget.at.id)
            .map(scenario => {
                const scenarioResultId = createScenarioResultId(
                    testResultId,
                    scenario.id
                );
                return {
                    id: scenarioResultId,
                    scenarioId: scenario.id,
                    output: null,
                    assertionResults: test.assertions.map(assertion => {
                        return {
                            id: createAssertionResultId(
                                scenarioResultId,
                                assertion.id
                            ),
                            assertionId: assertion.id,
                            passed: null,
                            failedReason: null
                        };
                    }),
                    unexpectedBehaviors: []
                };
            })
    };
};

module.exports = createTestResultSkeleton;
