const {
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId
} = require('../../services/PopulatedData/locationOfDataId');

/**
 * Determine whether a given assertion belongs to a given scenario and includes
 * at least one exception with a given priority.
 *
 * @param {Assertion} assertion
 * @param {Scenario} scenario
 * @param {string} priority
 */
const hasExceptionWithPriority = (assertion, scenario, priority) => {
    return assertion.assertionExceptions?.some(
        exception =>
            scenario.commands.find(
                command =>
                    command.id === exception.commandId &&
                    command.atOperatingMode === exception.settings
            ) && exception.priority === priority
    );
};

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
                    assertionResults: test.assertions
                        // Filter out assertionResults for the current scenario which were marked
                        // with a 0-priority exception
                        .filter(
                            assertion =>
                                !hasExceptionWithPriority(
                                    assertion,
                                    scenario,
                                    'EXCLUDE'
                                )
                        )
                        .map(assertion => ({
                            id: createAssertionResultId(
                                scenarioResultId,
                                assertion.id
                            ),
                            assertionId: assertion.id,
                            passed: null
                        })),
                    unexpectedBehaviors: null
                };
            })
    };
};

module.exports = createTestResultSkeleton;
