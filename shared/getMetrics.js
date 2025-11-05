const checkAssertionResultExceptionMatch = require('./checkAssertionResultExceptionMatch');
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
    ) && scenarioResult.negativeSideEffects.length === 0
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
  status
}) => {
  const countScenarioResult = scenarioResult => {
    const isClient =
      `${priority.toLowerCase()}AssertionResults` in scenarioResult;

    let assertionResults;
    if (isClient) {
      assertionResults =
        scenarioResult?.[`${priority.toLowerCase()}AssertionResults`] || [];
    } else {
      assertionResults = scenarioResult.assertionResults.filter(a =>
        checkAssertionResultExceptionMatch(a, scenarioResult, priority)
      );
    }

    if (status === 'untestable') {
      return scenarioResult.untestable ? assertionResults.length : 0;
    }

    if (status === 'passed') {
      // In an untestable scenario, no assertions are considered passing.
      return scenarioResult.untestable
        ? 0
        : assertionResults.filter(each => each.passed).length;
    }

    return assertionResults.length;
  };
  return countAvailableData(countScenarioResult, {
    testPlanReport,
    testResult,
    scenarioResult
  });
};

const countNegativeSideEffects = ({
  testPlanReport, // Choose one to provide
  testResult, // Choose one to provide
  scenarioResult // Choose one to provide
}) => {
  const countScenarioResult = scenarioResult => {
    return scenarioResult?.negativeSideEffects?.length || 0;
  };
  return countAvailableData(countScenarioResult, {
    testPlanReport,
    testResult,
    scenarioResult
  });
};

const countNegativeSideEffectsImpact = (
  {
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult // Choose one to provide
  },
  impact
) => {
  const countScenarioResult = scenarioResult => {
    return scenarioResult?.negativeSideEffects?.some(e => e.impact === impact)
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

const countFeatures = ({
  testPlanReport, // Choose one to provide
  testResult, // Choose one to provide
  scenarioResult, // Choose one to provide
  featureType, // 'aria' or 'htmlAam'
  status // 'passed', 'failed', 'untestable'
}) => {
  const countScenarioResult = scenarioResult => {
    const isClient =
      'mustAssertionResults' in scenarioResult ||
      'shouldAssertionResults' in scenarioResult;

    let assertionResults;
    if (isClient) {
      assertionResults = [
        ...scenarioResult.mustAssertionResults,
        ...scenarioResult.shouldAssertionResults
      ];
    } else {
      assertionResults = [
        ...scenarioResult.assertionResults.filter(a =>
          checkAssertionResultExceptionMatch(a, scenarioResult, 'MUST')
        ),
        ...scenarioResult.assertionResults.filter(a =>
          checkAssertionResultExceptionMatch(a, scenarioResult, 'SHOULD')
        )
      ];
    }

    if (!assertionResults) return 0;

    return assertionResults.reduce((count, assertionResult) => {
      if (!isClient) {
        if (
          !checkAssertionResultExceptionMatch(
            assertionResult,
            scenarioResult,
            'MUST'
          ) &&
          !checkAssertionResultExceptionMatch(
            assertionResult,
            scenarioResult,
            'SHOULD'
          )
        ) {
          return count;
        }
      }

      // If scenario is untestable, all assertions are untestable
      if (scenarioResult.untestable) {
        if (status === 'untestable' || status === undefined) {
          const references = assertionResult.assertion?.references || [];
          const featureReferences = references.filter(
            ref => ref.type === featureType
          );
          return count + featureReferences.length;
        }
        return count;
      }

      // Handle testable scenarios
      if (status === 'passed' && !assertionResult.passed) return count;
      if (status === 'failed' && assertionResult.passed) return count;
      if (status === 'untestable') return count;

      const references = assertionResult.assertion?.references || [];
      const featureReferences = references.filter(
        ref => ref.type === featureType
      );
      return count + featureReferences.length;
    }, 0);
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
    status: 'passed'
  });
  const assertionsUntestableCount = countAssertions({
    ...result,
    priority,
    status: 'untestable'
  });
  const assertionsCount = countAssertions({
    ...result,
    priority
  });
  const assertionsFailedCount =
    assertionsCount - assertionsPassedCount - assertionsUntestableCount;

  return {
    assertionsCount,
    assertionsPassedCount,
    assertionsFailedCount,
    assertionsUntestableCount
  };
};

const calculateFeatureCounts = (result, featureType) => {
  const count = countFeatures({ ...result, featureType });
  const passedCount = countFeatures({
    ...result,
    featureType,
    status: 'passed'
  });
  const failedCount = countFeatures({
    ...result,
    featureType,
    status: 'failed'
  });
  const untestableCount = countFeatures({
    ...result,
    featureType,
    status: 'untestable'
  });

  const formatted =
    count === 0
      ? false
      : `${Math.floor((passedCount / count) * 100)}% of passing`;

  return {
    count,
    passedCount,
    failedCount,
    untestableCount,
    formatted
  };
};

const calculatePerFeatureCounts = (result, featureType) => {
  const featureMap = new Map();

  const processScenarioResult = scenarioResult => {
    const isClient =
      'mustAssertionResults' in scenarioResult ||
      'shouldAssertionResults' in scenarioResult;

    const assertionResults = isClient
      ? [
          ...scenarioResult.mustAssertionResults,
          ...scenarioResult.shouldAssertionResults
        ]
      : [
          ...scenarioResult.assertionResults.filter(a =>
            checkAssertionResultExceptionMatch(a, scenarioResult, 'MUST')
          ),
          ...scenarioResult.assertionResults.filter(a =>
            checkAssertionResultExceptionMatch(a, scenarioResult, 'SHOULD')
          )
        ];

    if (!assertionResults) return;

    assertionResults.forEach(assertionResult => {
      if (!isClient) {
        if (
          !checkAssertionResultExceptionMatch(
            assertionResult,
            scenarioResult,
            'MUST'
          ) &&
          !checkAssertionResultExceptionMatch(
            assertionResult,
            scenarioResult,
            'SHOULD'
          )
        ) {
          return;
        }
      }

      const references = assertionResult.assertion?.references || [];
      const featureReferences = references.filter(
        ref => ref.type === featureType
      );

      featureReferences.forEach(featureRef => {
        const featureKey = featureRef.refId || featureRef.value;

        if (!featureMap.has(featureKey)) {
          featureMap.set(featureKey, {
            refId: featureRef.refId,
            type: featureRef.type,
            linkText: featureRef.linkText,
            rawLinkText: featureRef.rawLinkText || featureRef.linkText,
            value: featureRef.value,
            rawValue: featureRef.rawValue || featureRef.value,
            total: 0,
            passed: 0,
            failed: 0,
            untestable: 0
          });
        }

        const feature = featureMap.get(featureKey);
        feature.total++;

        // If scenario is untestable, all assertions are untestable
        if (scenarioResult.untestable) {
          feature.untestable++;
        } else {
          // Handle testable scenarios
          if (assertionResult.passed) {
            feature.passed++;
          } else {
            feature.failed++;
          }
        }
      });
    });
  };

  const processTestResult = testResult => {
    testResult?.scenarioResults?.forEach(processScenarioResult);
  };

  const processTestPlanReport = testPlanReport => {
    testPlanReport?.finalizedTestResults?.forEach(processTestResult);
  };

  if (result.testPlanReport) {
    processTestPlanReport(result.testPlanReport);
  } else if (result.testResult) {
    processTestResult(result.testResult);
  } else if (result.scenarioResult) {
    processScenarioResult(result.scenarioResult);
  }

  return Array.from(featureMap.values()).map(feature => ({
    ...feature,
    passedPercentage:
      feature.total === 0
        ? 0
        : Math.floor((feature.passed / feature.total) * 100),
    formatted:
      feature.total === 0
        ? '0% of passing'
        : `${Math.floor((feature.passed / feature.total) * 100)}% of passing`
  }));
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
  const severeImpactFailedAssertionCount = countNegativeSideEffectsImpact(
    { ...result },
    'SEVERE'
  );
  const moderateImpactFailedAssertionCount = countNegativeSideEffectsImpact(
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
    assertionsFailedCount: mustAssertionsFailedCount,
    assertionsUntestableCount: mustAssertionsUntestableCount
  } = calculateAssertionPriorityCounts(result, 'MUST');
  mustAssertionsCount += commandsCount;
  mustAssertionsPassedCount += severeImpactPassedAssertionCount;
  mustAssertionsFailedCount += severeImpactFailedAssertionCount;

  let {
    assertionsCount: shouldAssertionsCount,
    assertionsPassedCount: shouldAssertionsPassedCount,
    assertionsFailedCount: shouldAssertionsFailedCount,
    assertionsUntestableCount: shouldAssertionsUntestableCount
  } = calculateAssertionPriorityCounts(result, 'SHOULD');
  shouldAssertionsCount += commandsCount;
  shouldAssertionsPassedCount += moderateImpactPassedAssertionCount;
  shouldAssertionsFailedCount += moderateImpactFailedAssertionCount;

  const {
    assertionsCount: mayAssertionsCount,
    assertionsPassedCount: mayAssertionsPassedCount,
    assertionsFailedCount: mayAssertionsFailedCount,
    assertionsUntestableCount: mayAssertionsUntestableCount
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

  const negativeSideEffectCount = countNegativeSideEffects({ ...result });
  const negativeSideEffectsFormatted =
    negativeSideEffectCount === 0 ? false : `${negativeSideEffectCount} found`;

  const {
    count: ariaFeaturesCount,
    passedCount: ariaFeaturesPassedCount,
    failedCount: ariaFeaturesFailedCount,
    untestableCount: ariaFeaturesUntestableCount,
    formatted: ariaFeaturesFormatted
  } = calculateFeatureCounts(result, 'aria');
  const {
    count: htmlFeaturesCount,
    passedCount: htmlFeaturesPassedCount,
    failedCount: htmlFeaturesFailedCount,
    untestableCount: htmlFeaturesUntestableCount,
    formatted: htmlFeaturesFormatted
  } = calculateFeatureCounts(result, 'htmlAam');
  const ariaFeatures = calculatePerFeatureCounts(result, 'aria');
  const htmlFeatures = calculatePerFeatureCounts(result, 'htmlAam');

  let supportLevel;
  if (negativeSideEffectCount > 0 || mustAssertionsFailedCount > 0) {
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

  const assertionsUntestableCount =
    mustAssertionsUntestableCount +
    shouldAssertionsUntestableCount +
    mayAssertionsUntestableCount;

  return {
    assertionsPassedCount,
    assertionsFailedCount,
    assertionsUntestableCount,
    mustAssertionsPassedCount,
    mustAssertionsCount,
    mustAssertionsFailedCount,
    mustAssertionsUntestableCount,
    shouldAssertionsPassedCount,
    shouldAssertionsCount,
    shouldAssertionsFailedCount,
    shouldAssertionsUntestableCount,
    mayAssertionsPassedCount,
    mayAssertionsCount,
    mayAssertionsFailedCount,
    mayAssertionsUntestableCount,
    testsPassedCount,
    testsCount,
    testsFailedCount,
    negativeSideEffectCount,
    severeImpactPassedAssertionCount,
    severeImpactFailedAssertionCount,
    moderateImpactPassedAssertionCount,
    moderateImpactFailedAssertionCount,
    commandsCount,
    ariaFeaturesPassedCount,
    ariaFeaturesCount,
    ariaFeaturesFailedCount,
    ariaFeaturesUntestableCount,
    htmlFeaturesPassedCount,
    htmlFeaturesCount,
    htmlFeaturesFailedCount,
    htmlFeaturesUntestableCount,
    mustFormatted,
    shouldFormatted,
    mayFormatted,
    negativeSideEffectsFormatted,
    ariaFeaturesFormatted,
    htmlFeaturesFormatted,
    ariaFeatures,
    htmlFeatures,
    supportLevel,
    supportPercent
  };
};

module.exports = getMetrics;
