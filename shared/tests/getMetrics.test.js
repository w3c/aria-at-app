const getMetrics = require('../getMetrics');
const { calculatePercentage, trimDecimals } = require('../calculations');
// eslint-disable-next-line jest/no-mocks-import
const testPlanReport = require('./__mocks__/testPlanReportForMetrics.json');

const generateRandomNumber = (max, min = 1) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateTestPlanReport = () => {
  let testPlanReport = {
    id: generateRandomNumber(200)
  };

  let runnableTests = [];
  let finalizedTestResults = [];

  const testsCount = generateRandomNumber(12);
  let testsPassedCount = 0;
  let mustAssertionsCount = 0;
  let mustAssertionsPassedCount = 0;
  let mustAssertionsFailedCount = 0;
  let shouldAssertionsCount = 0;
  let shouldAssertionsPassedCount = 0;
  let shouldAssertionsFailedCount = 0;
  let mayAssertionsCount = 0;
  let mayAssertionsPassedCount = 0;
  let mayAssertionsFailedCount = 0;
  let commandsCount = 0;
  let unexpectedBehaviorCount = 0;
  let severeImpactFailedAssertionCount = 0;
  let moderateImpactFailedAssertionCount = 0;

  for (let runnableTestId = 1; runnableTestId <= testsCount; runnableTestId++) {
    runnableTests.push({ id: runnableTestId });
    const finalizedTestResultId = runnableTestId;

    let isTestPassed = true;

    let scenarioResults = [];
    const scenariosCount = generateRandomNumber(5);
    for (
      let scenarioResultId = 1;
      scenarioResultId <= scenariosCount;
      scenarioResultId++
    ) {
      let scenario = {
        commands: []
      };
      let assertionResults = [];
      let mustAssertionResults = [];
      let shouldAssertionResults = [];
      let mayAssertionResults = [];
      let unexpectedBehaviors = [];

      const commandsLength = generateRandomNumber(6);
      for (let commandId = 1; commandId <= commandsLength; commandId++) {
        let command = { id: commandId };
        scenario.commands.push(command);
      }

      const mustLength = generateRandomNumber(4, 1);
      for (let mustIndex = 0; mustIndex < mustLength; mustIndex++) {
        mustAssertionsCount++;
        const passed = Math.random() < 0.9;
        if (passed) mustAssertionsPassedCount++;
        else {
          mustAssertionsFailedCount++;
          isTestPassed = false;
        }

        const assertion = { passed };
        mustAssertionResults.push(assertion);
      }

      const shouldLength = generateRandomNumber(4, 0);
      for (let shouldIndex = 0; shouldIndex < shouldLength; shouldIndex++) {
        shouldAssertionsCount++;
        const passed = Math.random() < 0.5;
        if (passed) shouldAssertionsPassedCount++;
        else {
          shouldAssertionsFailedCount++;
          isTestPassed = false;
        }

        const assertion = { passed };
        shouldAssertionResults.push(assertion);
      }

      const mayLength = generateRandomNumber(3, 0);
      for (let mayIndex = 1; mayIndex <= mayLength; mayIndex++) {
        mayAssertionsCount++;
        const passed = Math.random() < 0.5;
        if (passed) mayAssertionsPassedCount++;
        else {
          mayAssertionsFailedCount++;
          isTestPassed = false;
        }

        const assertion = { passed };
        mayAssertionResults.push(assertion);
      }

      assertionResults = [
        ...mustAssertionResults,
        ...shouldAssertionResults,
        ...mayAssertionResults
      ];

      const unexpectedBehaviorsLength = generateRandomNumber(2, 0);
      unexpectedBehaviorCount += unexpectedBehaviorsLength;
      for (
        let unexpectedBehaviorIndex = 0;
        unexpectedBehaviorIndex < unexpectedBehaviorsLength;
        unexpectedBehaviorIndex++
      ) {
        // otherwise, do moderate
        const doSevere = Math.random() < 0.5;
        const impact = doSevere ? 'SEVERE' : 'MODERATE';

        const unexpectedBehavior = { impact };
        unexpectedBehaviors.push(unexpectedBehavior);
      }

      if (unexpectedBehaviors.some(({ impact }) => impact === 'SEVERE'))
        severeImpactFailedAssertionCount++;
      if (unexpectedBehaviors.some(({ impact }) => impact === 'MODERATE'))
        moderateImpactFailedAssertionCount++;

      const scenarioResult = {
        id: scenarioResultId,
        scenario,
        assertionResults,
        mustAssertionResults,
        shouldAssertionResults,
        mayAssertionResults,
        unexpectedBehaviors
      };
      scenarioResults.push(scenarioResult);
    }

    commandsCount += scenarioResults.length;
    if (isTestPassed) testsPassedCount++;

    const finalizedTestResult = { id: finalizedTestResultId, scenarioResults };
    finalizedTestResults.push(finalizedTestResult);
  }

  testPlanReport = { ...testPlanReport, runnableTests, finalizedTestResults };

  return {
    testPlanReport,
    testsCount,
    testsPassedCount,
    commandsCount,
    mustAssertionsCount,
    mustAssertionsPassedCount,
    mustAssertionsFailedCount,
    shouldAssertionsCount,
    shouldAssertionsPassedCount,
    shouldAssertionsFailedCount,
    mayAssertionsCount,
    mayAssertionsPassedCount,
    mayAssertionsFailedCount,
    unexpectedBehaviorCount,
    severeImpactFailedAssertionCount,
    moderateImpactFailedAssertionCount
  };
};

describe('getMetrics', () => {
  it('returns expected metrics object for generated data', () => {
    let {
      testPlanReport,
      testsCount,
      testsPassedCount,
      commandsCount,
      mustAssertionsCount,
      mustAssertionsPassedCount,
      mustAssertionsFailedCount,
      shouldAssertionsCount,
      shouldAssertionsPassedCount,
      shouldAssertionsFailedCount,
      mayAssertionsCount,
      mayAssertionsPassedCount,
      mayAssertionsFailedCount,
      unexpectedBehaviorCount,
      severeImpactFailedAssertionCount,
      moderateImpactFailedAssertionCount
    } = generateTestPlanReport();
    const metrics = getMetrics({ testPlanReport });

    const testsFailedCount = testsCount - testsPassedCount;

    const severeImpactPassedAssertionCount =
      commandsCount - severeImpactFailedAssertionCount;
    const moderateImpactPassedAssertionCount =
      commandsCount - moderateImpactFailedAssertionCount;

    mustAssertionsCount += commandsCount;
    mustAssertionsPassedCount += severeImpactPassedAssertionCount;
    mustAssertionsFailedCount += severeImpactFailedAssertionCount;

    shouldAssertionsCount += commandsCount;
    shouldAssertionsPassedCount += moderateImpactPassedAssertionCount;
    shouldAssertionsFailedCount += moderateImpactFailedAssertionCount;

    const supportLevel =
      unexpectedBehaviorCount > 0 || mustAssertionsFailedCount > 0
        ? 'FAILING'
        : shouldAssertionsFailedCount > 0
        ? 'ALL_REQUIRED'
        : 'FULL';

    const percentage = calculatePercentage(
      mustAssertionsPassedCount + shouldAssertionsPassedCount,
      mustAssertionsCount + shouldAssertionsCount
    );
    const supportPercent = trimDecimals(percentage);

    expect(metrics).toEqual(
      expect.objectContaining({
        assertionsPassedCount:
          mustAssertionsPassedCount +
          shouldAssertionsPassedCount +
          mayAssertionsPassedCount,
        assertionsFailedCount:
          mustAssertionsFailedCount +
          shouldAssertionsFailedCount +
          mayAssertionsFailedCount,
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
        mustFormatted: `${mustAssertionsPassedCount} of ${mustAssertionsCount} passed`,
        shouldFormatted:
          shouldAssertionsCount === 0
            ? false
            : `${shouldAssertionsPassedCount} of ${shouldAssertionsCount} passed`,
        mayFormatted:
          mayAssertionsCount === 0
            ? false
            : `${mayAssertionsPassedCount} of ${mayAssertionsCount} supported`,
        unexpectedBehaviorsFormatted:
          unexpectedBehaviorCount === 0
            ? false
            : `${unexpectedBehaviorCount} found`,
        supportLevel,
        supportPercent
      })
    );
  });

  it('returns expected metrics object for testPlanReport with client data', () => {
    const metrics = getMetrics({ testPlanReport });

    expect(metrics).toEqual(
      expect.objectContaining({
        assertionsPassedCount: 328,
        assertionsFailedCount: 90,
        mustAssertionsPassedCount: 206,
        mustAssertionsCount: 206,
        mustAssertionsFailedCount: 0,
        shouldAssertionsPassedCount: 122,
        shouldAssertionsCount: 206,
        shouldAssertionsFailedCount: 84,
        mayAssertionsPassedCount: 0,
        mayAssertionsCount: 6,
        mayAssertionsFailedCount: 6,
        testsPassedCount: 2,
        testsCount: 15,
        testsFailedCount: 13,
        unexpectedBehaviorCount: 0,
        severeImpactPassedAssertionCount: 55,
        severeImpactFailedAssertionCount: 0,
        moderateImpactPassedAssertionCount: 55,
        moderateImpactFailedAssertionCount: 0,
        commandsCount: 55,
        mustFormatted: '206 of 206 passed',
        shouldFormatted: '122 of 206 passed',
        mayFormatted: '0 of 6 supported',
        unexpectedBehaviorsFormatted: false,
        supportLevel: 'ALL_REQUIRED',
        supportPercent: 79
      })
    );
  });
});
