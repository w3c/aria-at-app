const getMetrics = require('../getMetrics');
const { calculatePercentage, trimDecimals } = require('../calculations');
// Based on real data from Color Viewer Slider V24.12.04 with VoiceOver for macOS and Safari
// https://aria-at.w3.org/report/163630/targets/324
// eslint-disable-next-line jest/no-mocks-import
const testPlanReport = require('./__mocks__/testPlanReportForMetricsFromLiveData.json');

const generateRandomNumber = (max, min = 1) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function generateTestPlanReport(reportSpec) {
  let idCount = 0;
  const id = () => String(++idCount);
  const boolToAssertion = passed => ({ passed });
  return {
    id: id(),
    runnableTests: Array(reportSpec.length)
      .fill()
      .map(() => ({ id: id() })),
    finalizedTestResults: reportSpec.map(testSpec => {
      return {
        id: id(),
        scenarioResults: testSpec.map(scenarioSpec => {
          const { must, should, may, unexpected } = scenarioSpec;
          return {
            id: id(),
            scenario: {
              commands: [{ id: 's' }]
            },
            assertionResults: [...must, ...should, ...may].map(boolToAssertion),
            mustAssertionResults: must.map(boolToAssertion),
            shouldAssertionResults: should.map(boolToAssertion),
            mayAssertionResults: may.map(boolToAssertion),
            unexpectedBehaviors: unexpected.map(impact => ({
              id: id(),
              impact
            }))
          };
        })
      };
    })
  };
}

const generateRandomizedTestPlanReport = () => {
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
        // To increase the chance of having at least 1 passed MUST assertion
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

      const assertionResults = [
        ...mustAssertionResults,
        ...shouldAssertionResults,
        ...mayAssertionResults
      ];

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

    // Scenarios being equivalent to the amount of commands
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
    } = generateRandomizedTestPlanReport();
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

    // Based on real data from Color Viewer Slider V24.12.04 with VoiceOver for macOS and Safari
    // https://aria-at.w3.org/report/163630/targets/324
    expect(metrics).toEqual(
      expect.objectContaining({
        testsCount: 9,
        mayFormatted: '2 of 8 supported',
        supportLevel: 'FAILING',
        commandsCount: 20,
        mustFormatted: '41 of 56 passed',
        supportPercent: 66,
        shouldFormatted: '20 of 36 passed',
        testsFailedCount: 7,
        testsPassedCount: 2,
        mayAssertionsCount: 8,
        mustAssertionsCount: 56,
        assertionsFailedCount: 37,
        assertionsPassedCount: 63,
        shouldAssertionsCount: 36,
        unexpectedBehaviorCount: 7,
        mayAssertionsFailedCount: 6,
        mayAssertionsPassedCount: 2,
        mustAssertionsFailedCount: 15,
        mustAssertionsPassedCount: 41,
        shouldAssertionsFailedCount: 16,
        shouldAssertionsPassedCount: 20,
        unexpectedBehaviorsFormatted: '7 found',
        severeImpactFailedAssertionCount: 7,
        severeImpactPassedAssertionCount: 13,
        moderateImpactFailedAssertionCount: 0,
        moderateImpactPassedAssertionCount: 20
      })
    );
  });

  it('returns expected metrics object for passing scenarioResult', () => {
    const testPlanReport = generateTestPlanReport([
      [{ must: [true], should: [], may: [true], unexpected: [] }]
    ]);
    const scenarioResult =
      testPlanReport.finalizedTestResults[0].scenarioResults[0];
    expect(getMetrics({ scenarioResult })).toEqual({
      assertionsPassedCount: 4,
      assertionsFailedCount: 0,
      mustAssertionsPassedCount: 2,
      mustAssertionsCount: 2,
      mustAssertionsFailedCount: 0,
      shouldAssertionsPassedCount: 1,
      shouldAssertionsCount: 1,
      shouldAssertionsFailedCount: 0,
      mayAssertionsPassedCount: 1,
      mayAssertionsCount: 1,
      mayAssertionsFailedCount: 0,
      testsPassedCount: 1,
      testsCount: 1,
      testsFailedCount: 0,
      unexpectedBehaviorCount: 0,
      severeImpactPassedAssertionCount: 1,
      severeImpactFailedAssertionCount: 0,
      moderateImpactPassedAssertionCount: 1,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 1,
      mustFormatted: '2 of 2 passed',
      shouldFormatted: '1 of 1 passed',
      mayFormatted: '1 of 1 supported',
      unexpectedBehaviorsFormatted: false,
      supportLevel: 'FULL',
      supportPercent: 100
    });
  });

  it('returns expected metrics object for failing testPlanReport without unexpected behaviors', () => {
    const testPlanReport = generateTestPlanReport([
      [{ must: [true], should: [true], may: [true], unexpected: [] }],
      [{ must: [true, false], should: [true], may: [true], unexpected: [] }],
      [{ must: [false], should: [true, false], may: [false], unexpected: [] }]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 13,
      assertionsFailedCount: 4,
      mustAssertionsPassedCount: 5,
      mustAssertionsCount: 7,
      mustAssertionsFailedCount: 2,
      shouldAssertionsPassedCount: 6,
      shouldAssertionsCount: 7,
      shouldAssertionsFailedCount: 1,
      mayAssertionsPassedCount: 2,
      mayAssertionsCount: 3,
      mayAssertionsFailedCount: 1,
      testsPassedCount: 1,
      testsCount: 3,
      testsFailedCount: 2,
      unexpectedBehaviorCount: 0,
      severeImpactPassedAssertionCount: 3,
      severeImpactFailedAssertionCount: 0,
      moderateImpactPassedAssertionCount: 3,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 3,
      mustFormatted: '5 of 7 passed',
      shouldFormatted: '6 of 7 passed',
      mayFormatted: '2 of 3 supported',
      unexpectedBehaviorsFormatted: false,
      supportLevel: 'FAILING',
      supportPercent: 78
    });
  });

  it('returns expected metrics object for failing testPlanReport with 1 unexpected behavior', () => {
    const testPlanReport = generateTestPlanReport([
      [{ must: [true], should: [true], may: [true], unexpected: ['SEVERE'] }],
      [{ must: [true, false], should: [true], may: [true], unexpected: [] }],
      [{ must: [false], should: [true, false], may: [false], unexpected: [] }]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 12,
      assertionsFailedCount: 5,
      mustAssertionsPassedCount: 4,
      mustAssertionsCount: 7,
      mustAssertionsFailedCount: 3,
      shouldAssertionsPassedCount: 6,
      shouldAssertionsCount: 7,
      shouldAssertionsFailedCount: 1,
      mayAssertionsPassedCount: 2,
      mayAssertionsCount: 3,
      mayAssertionsFailedCount: 1,
      testsPassedCount: 0,
      testsCount: 3,
      testsFailedCount: 3,
      unexpectedBehaviorCount: 1,
      severeImpactPassedAssertionCount: 2,
      severeImpactFailedAssertionCount: 1,
      moderateImpactPassedAssertionCount: 3,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 3,
      mustFormatted: '4 of 7 passed',
      shouldFormatted: '6 of 7 passed',
      mayFormatted: '2 of 3 supported',
      unexpectedBehaviorsFormatted: '1 found',
      supportLevel: 'FAILING',
      supportPercent: 71
    });
  });

  it('returns expected metrics object for failing testPlanReport with 2 unexpected behaviors', () => {
    const testPlanReport = generateTestPlanReport([
      [{ must: [true], should: [true], may: [true], unexpected: ['SEVERE'] }],
      [{ must: [true, false], should: [true], may: [true], unexpected: [] }],
      [
        {
          must: [false],
          should: [true, false],
          may: [false],
          unexpected: ['MODERATE']
        }
      ]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 11,
      assertionsFailedCount: 6,
      mustAssertionsPassedCount: 4,
      mustAssertionsCount: 7,
      mustAssertionsFailedCount: 3,
      shouldAssertionsPassedCount: 5,
      shouldAssertionsCount: 7,
      shouldAssertionsFailedCount: 2,
      mayAssertionsPassedCount: 2,
      mayAssertionsCount: 3,
      mayAssertionsFailedCount: 1,
      testsPassedCount: 0,
      testsCount: 3,
      testsFailedCount: 3,
      unexpectedBehaviorCount: 2,
      severeImpactPassedAssertionCount: 2,
      severeImpactFailedAssertionCount: 1,
      moderateImpactPassedAssertionCount: 2,
      moderateImpactFailedAssertionCount: 1,
      commandsCount: 3,
      mustFormatted: '4 of 7 passed',
      shouldFormatted: '5 of 7 passed',
      mayFormatted: '2 of 3 supported',
      unexpectedBehaviorsFormatted: '2 found',
      supportLevel: 'FAILING',
      supportPercent: 64
    });
  });
});
