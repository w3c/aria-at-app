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
  return assertion.assertionExceptions?.some(exception => {
    // Match exceptions using joined commandIds and scenario settings
    const scenarioCommandId = (
      scenario.commandIds || scenario.commands.map(({ id }) => id)
    ).join(' ');
    const scenarioSettings =
      scenario.settings || scenario.commands?.[0]?.atOperatingMode;

    return (
      scenarioCommandId === exception.commandId &&
      scenarioSettings === exception.settings &&
      exception.priority === priority
    );
  });
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
          untestable: false,
          assertionResults: (() => {
            // Exclude assertions with base EXCLUDE priority and
            // assertions excluded for this scenario via exception
            const keptAssertions = test.assertions.filter(
              assertion =>
                assertion.priority !== 'EXCLUDE' &&
                !hasExceptionWithPriority(assertion, scenario, 'EXCLUDE')
            );
            return keptAssertions.map(assertion => ({
              id: createAssertionResultId(scenarioResultId, assertion.id),
              assertionId: assertion.id,
              passed: null
            }));
          })(),
          unexpectedBehaviors: null
        };
      })
  };
};

module.exports = createTestResultSkeleton;
