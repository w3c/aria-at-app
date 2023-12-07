const {
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId
} = require('../../services/PopulatedData/locationOfDataId');

const createTestResultSkeleton = ({
    test,
    testPlanRun,
    testPlanReport,
    atVersionId,
    browserVersionId
}) => {
    const testResultId = createTestResultId(testPlanRun.id, test.id);

    return {
        id: testResultId,
        testId: test.id,
        atVersionId,
        browserVersionId,
        startedAt: new Date(),
        scenarioResults: test.scenarios
            .filter(each => each.at.id === testPlanReport.at.id)
            .map(scenario => {
                const scenarioResultId = createScenarioResultId(
                    testResultId,
                    scenario.id
                );
                return {
                    id: scenarioResultId,
                    scenarioId: scenario.id,
                    output: null,
                    assertionResults: test.assertions.map(assertion => ({
                        id: createAssertionResultId(
                            scenarioResultId,
                            assertion.id
                        ),
                        assertionId: assertion.id,
                        passed: null,
                        exclude: assertion.assertionExceptions?.some(
                            e =>
                                scenario.commands.find(
                                    c =>
                                        c.id === e.commandId &&
                                        c.settings === e.settings
                                ) && e.priority === 'EXCLUDE'
                        )
                    })),
                    unexpectedBehaviors: null
                };
            })
    };
};

module.exports = createTestResultSkeleton;
