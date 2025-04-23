const convertAssertionPriority = require('./convertAssertionPriority');
const { calculatePercentage, trimDecimals } = require('./calculations');

const sum = arr => arr?.reduce((total, item) => total + item, 0) || 0;

const countTests = ({
  testPlanReport, // Choose one to provide
  testResult, // Choose one to provide
  scenarioResult, // Choose one to provide
  passedOnly
}) => {
  const countScenarioResult = scenarioResult => {
    return scenarioResult?.assertionResults?.every(
      assertionResult => assertionResult.passed
    ) && scenarioResult.unexpectedBehaviors.length === 0
      ? 1
      : 0;
  };

  const countTestResult = testResult => {
    if (passedOnly)
      return testResult?.scenarioResults?.every(countScenarioResult) ? 1 : 0;
    return testResult ? 1 : 0;
  };
  const countTestPlanReport = testPlanReport => {
    return sum(
      testPlanReport?.finalizedTestResults?.map(countTestResult) || []
    );
  };

  if (testPlanReport) return countTestPlanReport(testPlanReport);
  if (testResult) return countTestResult(testResult);
  return countScenarioResult(scenarioResult);
};

const countAvailableData = (
  countScenarioResult,
  { testPlanReport, testResult, scenarioResult }
) => {
  const countTestResult = testResult => {
    return sum(testResult?.scenarioResults?.map(countScenarioResult) || []);
  };
  const countTestPlanReport = testPlanReport => {
    return sum(
      testPlanReport?.finalizedTestResults?.map(countTestResult) || []
    );
  };

  if (testPlanReport) return countTestPlanReport(testPlanReport);
  if (testResult) return countTestResult(testResult);
  return countScenarioResult(scenarioResult);
};

const countAssertions = ({
  testPlanReport, // Choose one to provide
  testResult, // Choose one to provide
  scenarioResult, // Choose one to provide
  priority,
  passedOnly
}) => {
  const countScenarioResult = scenarioResult => {
    const isClient =
      `${priority.toLowerCase()}AssertionResults` in scenarioResult;
    let all;
    if (isClient) {
      all = scenarioResult?.[`${priority.toLowerCase()}AssertionResults`] || [];
    } else {
      all = scenarioResult.assertionResults.filter(a => {
        // Same as `server/resolvers/ScenarioResult/assertionResultsResolver.js`
        if (a.assertion?.assertionExceptions?.length) {
          const scenarioSettings = scenarioResult.scenario.settings;
          const scenarioCommandId =
            scenarioResult.scenario.commandIds.join(' ');

          const foundException = a.assertion.assertionExceptions.find(
            exception =>
              exception.settings === scenarioSettings &&
              exception.commandId === scenarioCommandId
          );

          if (foundException) {
            return (
              convertAssertionPriority(foundException.priority) ===
              convertAssertionPriority(priority)
            );
          }
        }

        return (
          convertAssertionPriority(a.assertion.priority) ===
          convertAssertionPriority(priority)
        );
      });
    }
    if (passedOnly) return all.filter(each => each.passed).length;
    return all.length;
  };
  return countAvailableData(countScenarioResult, {
    testPlanReport,
    testResult,
    scenarioResult
  });
};

const countUnexpectedBehaviors = ({
  testPlanReport, // Choose one to provide
  testResult, // Choose one to provide
  scenarioResult // Choose one to provide
}) => {
  const countScenarioResult = scenarioResult => {
    return scenarioResult?.unexpectedBehaviors?.length || 0;
  };
  return countAvailableData(countScenarioResult, {
    testPlanReport,
    testResult,
    scenarioResult
  });
};

const countUnexpectedBehaviorsImpact = (
  {
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult // Choose one to provide
  },
  impact
) => {
  const countScenarioResult = scenarioResult => {
    return scenarioResult?.unexpectedBehaviors?.some(e => e.impact === impact)
      ? 1
      : 0;
  };
  return countAvailableData(countScenarioResult, {
    testPlanReport,
    testResult,
    scenarioResult
  });
};

const countCommands = ({
  testPlanReport, // Choose one to provide
  testResult, // Choose one to provide
  scenarioResult // Choose one to provide
}) => {
  const countScenarioResult = scenarioResult => {
    return scenarioResult?.scenario?.commands?.length ? 1 : 0;
  };
  return countAvailableData(countScenarioResult, {
    testPlanReport,
    testResult,
    scenarioResult
  });
};

const calculateAssertionPriorityCounts = (result, priority) => {
  const assertionsPassedCount = countAssertions({
    ...result,
    priority,
    passedOnly: true
  });
  const assertionsCount = countAssertions({
    ...result,
    priority
  });
  const assertionsFailedCount = assertionsCount - assertionsPassedCount;

  return { assertionsCount, assertionsPassedCount, assertionsFailedCount };
};

const getMetrics = ({
  scenarioResult, // Choose one to provide
  testResult, // Choose one to provide
  testPlanReport // Choose one to provide
}) => {
  const result = { scenarioResult, testResult, testPlanReport };

  const commandsCount = countCommands({ ...result });

  // NOTE: Each command has 2 additional assertions:
  // * Severe negative side effects do not occur
  // * Moderate negative side effects do not occur
  // TODO: Include this from the db assertions now that this has been agreed upon
  const severeImpactFailedAssertionCount = countUnexpectedBehaviorsImpact(
    { ...result },
    'SEVERE'
  );
  const moderateImpactFailedAssertionCount = countUnexpectedBehaviorsImpact(
    { ...result },
    'MODERATE'
  );

  const severeImpactPassedAssertionCount =
    commandsCount - severeImpactFailedAssertionCount;
  const moderateImpactPassedAssertionCount =
    commandsCount - moderateImpactFailedAssertionCount;

  let {
    assertionsCount: mustAssertionsCount,
    assertionsPassedCount: mustAssertionsPassedCount,
    assertionsFailedCount: mustAssertionsFailedCount
  } = calculateAssertionPriorityCounts(result, 'MUST');
  mustAssertionsCount += commandsCount;
  mustAssertionsPassedCount += severeImpactPassedAssertionCount;
  mustAssertionsFailedCount += severeImpactFailedAssertionCount;

  let {
    assertionsCount: shouldAssertionsCount,
    assertionsPassedCount: shouldAssertionsPassedCount,
    assertionsFailedCount: shouldAssertionsFailedCount
  } = calculateAssertionPriorityCounts(result, 'SHOULD');
  shouldAssertionsCount += commandsCount;
  shouldAssertionsPassedCount += moderateImpactPassedAssertionCount;
  shouldAssertionsFailedCount += moderateImpactFailedAssertionCount;

  const {
    assertionsCount: mayAssertionsCount,
    assertionsPassedCount: mayAssertionsPassedCount,
    assertionsFailedCount: mayAssertionsFailedCount
  } = calculateAssertionPriorityCounts(result, 'MAY');

  const testsPassedCount = countTests({
    ...result,
    passedOnly: true
  });
  const testsCount =
    testPlanReport?.runnableTests?.length || countTests({ ...result });
  const testsFailedCount = testsCount - testsPassedCount;

  const mustFormatted = `${mustAssertionsPassedCount} of ${mustAssertionsCount} passed`;
  const shouldFormatted =
    shouldAssertionsCount === 0
      ? false
      : `${shouldAssertionsPassedCount} of ${shouldAssertionsCount} passed`;
  const mayFormatted =
    mayAssertionsCount === 0
      ? false
      : `${mayAssertionsPassedCount} of ${mayAssertionsCount} supported`;

  const unexpectedBehaviorCount = countUnexpectedBehaviors({ ...result });
  const unexpectedBehaviorsFormatted =
    unexpectedBehaviorCount === 0 ? false : `${unexpectedBehaviorCount} found`;

  let supportLevel;
  if (unexpectedBehaviorCount > 0 || mustAssertionsFailedCount > 0) {
    supportLevel = 'FAILING';
  } else if (shouldAssertionsFailedCount > 0) {
    supportLevel = 'ALL_REQUIRED';
  } else {
    supportLevel = 'FULL';
  }

  const percentage = calculatePercentage(
    mustAssertionsPassedCount + shouldAssertionsPassedCount,
    mustAssertionsCount + shouldAssertionsCount
  );
  const supportPercent = trimDecimals(percentage);

  const assertionsPassedCount =
    mustAssertionsPassedCount +
    shouldAssertionsPassedCount +
    mayAssertionsPassedCount;

  const assertionsFailedCount =
    mustAssertionsFailedCount +
    shouldAssertionsFailedCount +
    mayAssertionsFailedCount;

  return {
    assertionsPassedCount,
    assertionsFailedCount,
    mustAssertionsPassedCount,
    mustAssertionsCount,
    mustAssertionsFailedCount,
    shouldAssertionsPassedCount,
    shouldAssertionsCount,
    shouldAssertionsFailedCount,
    mayAssertionsPassedCount,
    mayAssertionsCount,
    mayAssertionsFailedCount,
    testsPassedCount,
    testsCount,
    testsFailedCount,
    unexpectedBehaviorCount,
    severeImpactPassedAssertionCount,
    severeImpactFailedAssertionCount,
    moderateImpactPassedAssertionCount,
    moderateImpactFailedAssertionCount,
    commandsCount,
    mustFormatted,
    shouldFormatted,
    mayFormatted,
    unexpectedBehaviorsFormatted,
    supportLevel,
    supportPercent
  };
};

module.exports = getMetrics;
