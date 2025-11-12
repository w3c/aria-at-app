const getMetrics = require('../getMetrics');
const { calculatePercentage, trimDecimals } = require('../calculations');
// Based on real data from Color Viewer Slider V24.12.04 with VoiceOver for macOS and Safari
// https://aria-at.w3.org/report/163630/targets/324
// eslint-disable-next-line jest/no-mocks-import
const testPlanReport = require('./__mocks__/testPlanReportForMetricsFromLiveData.json');

function generateTestPlanReport(reportSpec) {
  let idCount = 0;
  const id = () => String(++idCount);

  const createAssertion = (
    passed,
    ariaFeatures = [],
    htmlFeatures = [],
    featureIndex = 0
  ) => {
    const references = [];
    if (ariaFeatures[featureIndex]) {
      references.push({
        type: 'aria',
        ...ariaFeatures[featureIndex]
      });
    }
    if (htmlFeatures[featureIndex]) {
      references.push({
        type: 'htmlAam',
        ...htmlFeatures[featureIndex]
      });
    }

    return {
      passed,
      assertion: { references }
    };
  };

  return {
    id: id(),
    runnableTests: Array(reportSpec.length)
      .fill()
      .map(() => ({ id: id() })),
    finalizedTestResults: reportSpec.map(testSpec => {
      return {
        id: id(),
        scenarioResults: testSpec.map(scenarioSpec => {
          let {
            must,
            should,
            may,
            untestable,
            unexpected,
            ariaFeatures = [],
            htmlFeatures = []
          } = scenarioSpec;

          let featureIndex = 0;
          must = must.map(passed =>
            createAssertion(passed, ariaFeatures, htmlFeatures, featureIndex++)
          );
          should = should.map(passed =>
            createAssertion(passed, ariaFeatures, htmlFeatures, featureIndex++)
          );
          may = may.map(passed =>
            createAssertion(passed, ariaFeatures, htmlFeatures, featureIndex++)
          );

          return {
            id: id(),
            scenario: {
              commands: [{ id: 's' }]
            },
            untestable,
            assertionResults: [...must, ...should, ...may],
            mustAssertionResults: must,
            shouldAssertionResults: should,
            mayAssertionResults: may,
            negativeSideEffects: unexpected.map(impact => ({
              id: id(),
              impact
            }))
          };
        })
      };
    })
  };
}

const generateStructuredTestPlanReport = () => {
  let testPlanReport = {
    id: 500
  };

  let runnableTests = [];
  let finalizedTestResults = [];

  const testsCount = 12;
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
  let negativeSideEffectCount = 0;
  let severeImpactFailedAssertionCount = 0;
  let moderateImpactFailedAssertionCount = 0;

  for (let runnableTestId = 1; runnableTestId <= testsCount; runnableTestId++) {
    runnableTests.push({ id: runnableTestId });
    const finalizedTestResultId = runnableTestId;

    let isTestPassed = true;

    let scenarioResults = [];
    const scenariosCount = 5;
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
      let negativeSideEffects = [];

      const commandsLength = 6;
      for (let commandId = 1; commandId <= commandsLength; commandId++) {
        let command = { id: commandId };
        scenario.commands.push(command);
      }

      const mustLength = 5;
      for (let mustIndex = 0; mustIndex < mustLength; mustIndex++) {
        mustAssertionsCount++;
        // To increase the chance of having at least 1 passed MUST assertion
        const passed = mustIndex % 2 === 0;
        if (passed) mustAssertionsPassedCount++;
        else {
          mustAssertionsFailedCount++;
          isTestPassed = false;
        }

        const assertion = { passed };
        mustAssertionResults.push(assertion);
      }

      const shouldLength = 5;
      for (let shouldIndex = 0; shouldIndex < shouldLength; shouldIndex++) {
        shouldAssertionsCount++;
        const passed = shouldIndex % 2 === 0;
        if (passed) shouldAssertionsPassedCount++;
        else {
          shouldAssertionsFailedCount++;
          isTestPassed = false;
        }

        const assertion = { passed };
        shouldAssertionResults.push(assertion);
      }

      const mayLength = 3;
      for (let mayIndex = 1; mayIndex <= mayLength; mayIndex++) {
        mayAssertionsCount++;
        const passed = mayIndex % 2 === 0;
        if (passed) mayAssertionsPassedCount++;
        else {
          mayAssertionsFailedCount++;
          isTestPassed = false;
        }

        const assertion = { passed };
        mayAssertionResults.push(assertion);
      }

      const negativeSideEffectsLength = 3;
      negativeSideEffectCount += negativeSideEffectsLength;
      for (
        let negativeSideEffectIndex = 0;
        negativeSideEffectIndex < negativeSideEffectsLength;
        negativeSideEffectIndex++
      ) {
        // otherwise, do moderate
        const doSevere = negativeSideEffectIndex % 2 === 0;
        const impact = doSevere ? 'SEVERE' : 'MODERATE';

        const negativeSideEffect = { impact };
        negativeSideEffects.push(negativeSideEffect);
      }

      // if there are any negative side effects, the test should fail
      if (negativeSideEffects.length > 0) isTestPassed = false;
      if (negativeSideEffects.some(({ impact }) => impact === 'SEVERE'))
        severeImpactFailedAssertionCount++;
      if (negativeSideEffects.some(({ impact }) => impact === 'MODERATE'))
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
        negativeSideEffects
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
    negativeSideEffectCount,
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
      negativeSideEffectCount,
      severeImpactFailedAssertionCount,
      moderateImpactFailedAssertionCount
    } = generateStructuredTestPlanReport();
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
      negativeSideEffectCount > 0 || mustAssertionsFailedCount > 0
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
        assertionsUntestableCount: 0,
        mustAssertionsPassedCount,
        mustAssertionsCount,
        mustAssertionsFailedCount,
        mustAssertionsUntestableCount: 0,
        shouldAssertionsPassedCount,
        shouldAssertionsCount,
        shouldAssertionsFailedCount,
        shouldAssertionsUntestableCount: 0,
        mayAssertionsPassedCount,
        mayAssertionsCount,
        mayAssertionsFailedCount,
        mayAssertionsUntestableCount: 0,
        testsPassedCount,
        testsCount,
        testsFailedCount,
        negativeSideEffectCount,
        severeImpactPassedAssertionCount,
        severeImpactFailedAssertionCount,
        moderateImpactPassedAssertionCount,
        moderateImpactFailedAssertionCount,
        commandsCount,
        ariaFeaturesPassedCount: 0,
        ariaFeaturesCount: 0,
        ariaFeaturesFailedCount: 0,
        ariaFeaturesUntestableCount: 0,
        htmlFeaturesPassedCount: 0,
        htmlFeaturesCount: 0,
        htmlFeaturesFailedCount: 0,
        htmlFeaturesUntestableCount: 0,
        mustFormatted: `${mustAssertionsPassedCount} of ${mustAssertionsCount} passed`,
        shouldFormatted:
          shouldAssertionsCount === 0
            ? false
            : `${shouldAssertionsPassedCount} of ${shouldAssertionsCount} passed`,
        mayFormatted:
          mayAssertionsCount === 0
            ? false
            : `${mayAssertionsPassedCount} of ${mayAssertionsCount} supported`,
        negativeSideEffectsFormatted:
          negativeSideEffectCount === 0
            ? false
            : `${negativeSideEffectCount} found`,
        ariaFeaturesFormatted: false,
        htmlFeaturesFormatted: false,
        ariaFeatures: [],
        htmlFeatures: [],
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
        assertionsUntestableCount: 0,
        shouldAssertionsCount: 36,
        negativeSideEffectCount: 7,
        mayAssertionsFailedCount: 6,
        mayAssertionsPassedCount: 2,
        mayAssertionsUntestableCount: 0,
        mustAssertionsFailedCount: 15,
        mustAssertionsPassedCount: 41,
        mustAssertionsUntestableCount: 0,
        shouldAssertionsFailedCount: 16,
        shouldAssertionsPassedCount: 20,
        shouldAssertionsUntestableCount: 0,
        negativeSideEffectsFormatted: '7 found',
        severeImpactFailedAssertionCount: 7,
        severeImpactPassedAssertionCount: 13,
        moderateImpactFailedAssertionCount: 0,
        moderateImpactPassedAssertionCount: 20,
        ariaFeaturesPassedCount: 0,
        ariaFeaturesCount: 0,
        ariaFeaturesFailedCount: 0,
        ariaFeaturesUntestableCount: 0,
        htmlFeaturesPassedCount: 0,
        htmlFeaturesCount: 0,
        htmlFeaturesFailedCount: 0,
        htmlFeaturesUntestableCount: 0,
        ariaFeaturesFormatted: false,
        htmlFeaturesFormatted: false,
        ariaFeatures: [],
        htmlFeatures: []
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
      assertionsUntestableCount: 0,
      mustAssertionsPassedCount: 2,
      mustAssertionsCount: 2,
      mustAssertionsFailedCount: 0,
      mustAssertionsUntestableCount: 0,
      shouldAssertionsPassedCount: 1,
      shouldAssertionsCount: 1,
      shouldAssertionsFailedCount: 0,
      shouldAssertionsUntestableCount: 0,
      mayAssertionsPassedCount: 1,
      mayAssertionsCount: 1,
      mayAssertionsFailedCount: 0,
      mayAssertionsUntestableCount: 0,
      testsPassedCount: 1,
      testsCount: 1,
      testsFailedCount: 0,
      negativeSideEffectCount: 0,
      severeImpactPassedAssertionCount: 1,
      severeImpactFailedAssertionCount: 0,
      moderateImpactPassedAssertionCount: 1,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 1,
      ariaFeaturesPassedCount: 0,
      ariaFeaturesCount: 0,
      ariaFeaturesFailedCount: 0,
      ariaFeaturesUntestableCount: 0,
      htmlFeaturesPassedCount: 0,
      htmlFeaturesCount: 0,
      htmlFeaturesFailedCount: 0,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '2 of 2 passed',
      shouldFormatted: '1 of 1 passed',
      mayFormatted: '1 of 1 supported',
      negativeSideEffectsFormatted: false,
      ariaFeaturesFormatted: false,
      htmlFeaturesFormatted: false,
      ariaFeatures: [],
      htmlFeatures: [],
      supportLevel: 'FULL',
      supportPercent: 100
    });
  });

  it('returns expected metrics object for failing testPlanReport without negative side effects', () => {
    const testPlanReport = generateTestPlanReport([
      [{ must: [true], should: [true], may: [true], unexpected: [] }],
      [{ must: [true, false], should: [true], may: [true], unexpected: [] }],
      [{ must: [false], should: [true, false], may: [false], unexpected: [] }]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 13,
      assertionsFailedCount: 4,
      assertionsUntestableCount: 0,
      mustAssertionsPassedCount: 5,
      mustAssertionsCount: 7,
      mustAssertionsFailedCount: 2,
      mustAssertionsUntestableCount: 0,
      shouldAssertionsPassedCount: 6,
      shouldAssertionsCount: 7,
      shouldAssertionsFailedCount: 1,
      shouldAssertionsUntestableCount: 0,
      mayAssertionsPassedCount: 2,
      mayAssertionsCount: 3,
      mayAssertionsFailedCount: 1,
      mayAssertionsUntestableCount: 0,
      testsPassedCount: 1,
      testsCount: 3,
      testsFailedCount: 2,
      negativeSideEffectCount: 0,
      severeImpactPassedAssertionCount: 3,
      severeImpactFailedAssertionCount: 0,
      moderateImpactPassedAssertionCount: 3,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 3,
      ariaFeaturesPassedCount: 0,
      ariaFeaturesCount: 0,
      ariaFeaturesFailedCount: 0,
      ariaFeaturesUntestableCount: 0,
      htmlFeaturesPassedCount: 0,
      htmlFeaturesCount: 0,
      htmlFeaturesFailedCount: 0,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '5 of 7 passed',
      shouldFormatted: '6 of 7 passed',
      mayFormatted: '2 of 3 supported',
      negativeSideEffectsFormatted: false,
      ariaFeaturesFormatted: false,
      htmlFeaturesFormatted: false,
      ariaFeatures: [],
      htmlFeatures: [],
      supportLevel: 'FAILING',
      supportPercent: 78
    });
  });

  it('returns expected metrics object for failing testPlanReport with 1 negative side effect', () => {
    const testPlanReport = generateTestPlanReport([
      [{ must: [true], should: [true], may: [true], unexpected: ['SEVERE'] }],
      [{ must: [true, false], should: [true], may: [true], unexpected: [] }],
      [{ must: [false], should: [true, false], may: [false], unexpected: [] }]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 12,
      assertionsFailedCount: 5,
      assertionsUntestableCount: 0,
      mustAssertionsPassedCount: 4,
      mustAssertionsCount: 7,
      mustAssertionsFailedCount: 3,
      mustAssertionsUntestableCount: 0,
      shouldAssertionsPassedCount: 6,
      shouldAssertionsCount: 7,
      shouldAssertionsFailedCount: 1,
      shouldAssertionsUntestableCount: 0,
      mayAssertionsPassedCount: 2,
      mayAssertionsCount: 3,
      mayAssertionsFailedCount: 1,
      mayAssertionsUntestableCount: 0,
      testsPassedCount: 0,
      testsCount: 3,
      testsFailedCount: 3,
      negativeSideEffectCount: 1,
      severeImpactPassedAssertionCount: 2,
      severeImpactFailedAssertionCount: 1,
      moderateImpactPassedAssertionCount: 3,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 3,
      ariaFeaturesPassedCount: 0,
      ariaFeaturesCount: 0,
      ariaFeaturesFailedCount: 0,
      ariaFeaturesUntestableCount: 0,
      htmlFeaturesPassedCount: 0,
      htmlFeaturesCount: 0,
      htmlFeaturesFailedCount: 0,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '4 of 7 passed',
      shouldFormatted: '6 of 7 passed',
      mayFormatted: '2 of 3 supported',
      negativeSideEffectsFormatted: '1 found',
      ariaFeaturesFormatted: false,
      htmlFeaturesFormatted: false,
      ariaFeatures: [],
      htmlFeatures: [],
      supportLevel: 'FAILING',
      supportPercent: 71
    });
  });

  it('returns expected metrics object for failing testPlanReport with 2 negative side effects', () => {
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
      assertionsUntestableCount: 0,
      mustAssertionsPassedCount: 4,
      mustAssertionsCount: 7,
      mustAssertionsFailedCount: 3,
      mustAssertionsUntestableCount: 0,
      shouldAssertionsPassedCount: 5,
      shouldAssertionsCount: 7,
      shouldAssertionsFailedCount: 2,
      shouldAssertionsUntestableCount: 0,
      mayAssertionsPassedCount: 2,
      mayAssertionsCount: 3,
      mayAssertionsFailedCount: 1,
      mayAssertionsUntestableCount: 0,
      testsPassedCount: 0,
      testsCount: 3,
      testsFailedCount: 3,
      negativeSideEffectCount: 2,
      severeImpactPassedAssertionCount: 2,
      severeImpactFailedAssertionCount: 1,
      moderateImpactPassedAssertionCount: 2,
      moderateImpactFailedAssertionCount: 1,
      commandsCount: 3,
      ariaFeaturesPassedCount: 0,
      ariaFeaturesCount: 0,
      ariaFeaturesFailedCount: 0,
      ariaFeaturesUntestableCount: 0,
      htmlFeaturesPassedCount: 0,
      htmlFeaturesCount: 0,
      htmlFeaturesFailedCount: 0,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '4 of 7 passed',
      shouldFormatted: '5 of 7 passed',
      mayFormatted: '2 of 3 supported',
      negativeSideEffectsFormatted: '2 found',
      ariaFeaturesFormatted: false,
      htmlFeaturesFormatted: false,
      ariaFeatures: [],
      htmlFeatures: [],
      supportLevel: 'FAILING',
      supportPercent: 64
    });
  });

  it('returns expected metrics object for failing testPlanReport with untestable scenario', () => {
    const testPlanReport = generateTestPlanReport([
      [
        {
          must: [true],
          should: [true],
          may: [true],
          untestable: true,
          unexpected: ['SEVERE']
        }
      ],
      [{ must: [true, false], should: [true], may: [true], unexpected: [] }],
      [{ must: [false], should: [true, false], may: [false], unexpected: [] }]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 9,
      assertionsFailedCount: 5,
      assertionsUntestableCount: 3,
      mustAssertionsPassedCount: 3,
      mustAssertionsCount: 7,
      mustAssertionsFailedCount: 3,
      mustAssertionsUntestableCount: 1,
      shouldAssertionsPassedCount: 5,
      shouldAssertionsCount: 7,
      shouldAssertionsFailedCount: 1,
      shouldAssertionsUntestableCount: 1,
      mayAssertionsPassedCount: 1,
      mayAssertionsCount: 3,
      mayAssertionsFailedCount: 1,
      mayAssertionsUntestableCount: 1,
      testsPassedCount: 0,
      testsCount: 3,
      testsFailedCount: 3,
      negativeSideEffectCount: 1,
      severeImpactPassedAssertionCount: 2,
      severeImpactFailedAssertionCount: 1,
      moderateImpactPassedAssertionCount: 3,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 3,
      ariaFeaturesPassedCount: 0,
      ariaFeaturesCount: 0,
      ariaFeaturesFailedCount: 0,
      ariaFeaturesUntestableCount: 0,
      htmlFeaturesPassedCount: 0,
      htmlFeaturesCount: 0,
      htmlFeaturesFailedCount: 0,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '3 of 7 passed',
      shouldFormatted: '5 of 7 passed',
      mayFormatted: '1 of 3 supported',
      negativeSideEffectsFormatted: '1 found',
      ariaFeaturesFormatted: false,
      htmlFeaturesFormatted: false,
      ariaFeatures: [],
      htmlFeatures: [],
      supportLevel: 'FAILING',
      supportPercent: 57
    });
  });

  it('returns expected metrics object for testPlanReport with ARIA features', () => {
    const testPlanReport = generateTestPlanReport([
      [
        {
          must: [true, false],
          should: [true],
          may: [false],
          unexpected: [],
          ariaFeatures: [
            { refId: 'aria-expanded' },
            { refId: 'aria-controls' }
          ],
          htmlFeatures: []
        }
      ]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 4,
      assertionsFailedCount: 2,
      assertionsUntestableCount: 0,
      mustAssertionsPassedCount: 2,
      mustAssertionsCount: 3,
      mustAssertionsFailedCount: 1,
      mustAssertionsUntestableCount: 0,
      shouldAssertionsPassedCount: 2,
      shouldAssertionsCount: 2,
      shouldAssertionsFailedCount: 0,
      shouldAssertionsUntestableCount: 0,
      mayAssertionsPassedCount: 0,
      mayAssertionsCount: 1,
      mayAssertionsFailedCount: 1,
      mayAssertionsUntestableCount: 0,
      testsPassedCount: 0,
      testsCount: 1,
      testsFailedCount: 1,
      negativeSideEffectCount: 0,
      severeImpactPassedAssertionCount: 1,
      severeImpactFailedAssertionCount: 0,
      moderateImpactPassedAssertionCount: 1,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 1,
      ariaFeaturesPassedCount: 1,
      ariaFeaturesCount: 2,
      ariaFeaturesFailedCount: 1,
      ariaFeaturesUntestableCount: 0,
      htmlFeaturesPassedCount: 0,
      htmlFeaturesCount: 0,
      htmlFeaturesFailedCount: 0,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '2 of 3 passed',
      shouldFormatted: '2 of 2 passed',
      mayFormatted: '0 of 1 supported',
      negativeSideEffectsFormatted: false,
      ariaFeaturesFormatted: '50% of passing',
      htmlFeaturesFormatted: false,
      ariaFeatures: [
        {
          refId: 'aria-expanded',
          type: 'aria',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 1,
          failed: 0,
          untestable: 0,
          passedPercentage: 100,
          formatted: '100% of passing'
        },
        {
          refId: 'aria-controls',
          type: 'aria',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 0,
          failed: 1,
          untestable: 0,
          passedPercentage: 0,
          formatted: '0% of passing'
        }
      ],
      htmlFeatures: [],
      supportLevel: 'FAILING',
      supportPercent: 80
    });
  });

  it('returns expected metrics object for testPlanReport with HTML features', () => {
    const testPlanReport = generateTestPlanReport([
      [
        {
          must: [true],
          should: [false, true],
          may: [true],
          unexpected: [],
          ariaFeatures: [],
          htmlFeatures: [
            { refId: 'button' },
            { refId: 'input' },
            { refId: 'select' }
          ]
        }
      ]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 5,
      assertionsFailedCount: 1,
      assertionsUntestableCount: 0,
      mustAssertionsPassedCount: 2,
      mustAssertionsCount: 2,
      mustAssertionsFailedCount: 0,
      mustAssertionsUntestableCount: 0,
      shouldAssertionsPassedCount: 2,
      shouldAssertionsCount: 3,
      shouldAssertionsFailedCount: 1,
      shouldAssertionsUntestableCount: 0,
      mayAssertionsPassedCount: 1,
      mayAssertionsCount: 1,
      mayAssertionsFailedCount: 0,
      mayAssertionsUntestableCount: 0,
      testsPassedCount: 0,
      testsCount: 1,
      testsFailedCount: 1,
      negativeSideEffectCount: 0,
      severeImpactPassedAssertionCount: 1,
      severeImpactFailedAssertionCount: 0,
      moderateImpactPassedAssertionCount: 1,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 1,
      ariaFeaturesPassedCount: 0,
      ariaFeaturesCount: 0,
      ariaFeaturesFailedCount: 0,
      ariaFeaturesUntestableCount: 0,
      htmlFeaturesPassedCount: 2,
      htmlFeaturesCount: 3,
      htmlFeaturesFailedCount: 1,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '2 of 2 passed',
      shouldFormatted: '2 of 3 passed',
      mayFormatted: '1 of 1 supported',
      negativeSideEffectsFormatted: false,
      ariaFeaturesFormatted: false,
      htmlFeaturesFormatted: '66% of passing',
      ariaFeatures: [],
      htmlFeatures: [
        {
          refId: 'button',
          type: 'htmlAam',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 1,
          failed: 0,
          untestable: 0,
          passedPercentage: 100,
          formatted: '100% of passing'
        },
        {
          refId: 'input',
          type: 'htmlAam',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 0,
          failed: 1,
          untestable: 0,
          passedPercentage: 0,
          formatted: '0% of passing'
        },
        {
          refId: 'select',
          type: 'htmlAam',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 1,
          failed: 0,
          untestable: 0,
          passedPercentage: 100,
          formatted: '100% of passing'
        }
      ],
      supportLevel: 'ALL_REQUIRED',
      supportPercent: 80
    });
  });

  it('returns expected metrics object for testPlanReport with untestable ARIA features', () => {
    const testPlanReport = generateTestPlanReport([
      [
        {
          must: [true, false],
          should: [true],
          may: [false],
          untestable: true,
          unexpected: [],
          ariaFeatures: [
            { refId: 'aria-expanded' },
            { refId: 'aria-controls' }
          ],
          htmlFeatures: []
        }
      ]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 2,
      assertionsFailedCount: 0,
      assertionsUntestableCount: 4,
      mustAssertionsPassedCount: 1,
      mustAssertionsCount: 3,
      mustAssertionsFailedCount: 0,
      mustAssertionsUntestableCount: 2,
      shouldAssertionsPassedCount: 1,
      shouldAssertionsCount: 2,
      shouldAssertionsFailedCount: 0,
      shouldAssertionsUntestableCount: 1,
      mayAssertionsPassedCount: 0,
      mayAssertionsCount: 1,
      mayAssertionsFailedCount: 0,
      mayAssertionsUntestableCount: 1,
      testsPassedCount: 0,
      testsCount: 1,
      testsFailedCount: 1,
      negativeSideEffectCount: 0,
      severeImpactPassedAssertionCount: 1,
      severeImpactFailedAssertionCount: 0,
      moderateImpactPassedAssertionCount: 1,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 1,
      ariaFeaturesPassedCount: 0,
      ariaFeaturesCount: 2,
      ariaFeaturesFailedCount: 0,
      ariaFeaturesUntestableCount: 2,
      htmlFeaturesPassedCount: 0,
      htmlFeaturesCount: 0,
      htmlFeaturesFailedCount: 0,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '1 of 3 passed',
      shouldFormatted: '1 of 2 passed',
      mayFormatted: '0 of 1 supported',
      negativeSideEffectsFormatted: false,
      ariaFeaturesFormatted: '0% of passing',
      htmlFeaturesFormatted: false,
      ariaFeatures: [
        {
          refId: 'aria-expanded',
          type: 'aria',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 0,
          failed: 0,
          untestable: 1,
          passedPercentage: 0,
          formatted: '0% of passing'
        },
        {
          refId: 'aria-controls',
          type: 'aria',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 0,
          failed: 0,
          untestable: 1,
          passedPercentage: 0,
          formatted: '0% of passing'
        }
      ],
      htmlFeatures: [],
      supportLevel: 'FULL',
      supportPercent: 40
    });
  });

  it('returns expected metrics object for testPlanReport with mixed ARIA and HTML features', () => {
    const testPlanReport = generateTestPlanReport([
      [
        {
          must: [true, false],
          should: [true],
          may: [false],
          unexpected: [],
          ariaFeatures: [{ refId: 'aria-expanded' }],
          htmlFeatures: [{ refId: 'button' }, { refId: 'input' }]
        }
      ]
    ]);
    expect(getMetrics({ testPlanReport })).toEqual({
      assertionsPassedCount: 4,
      assertionsFailedCount: 2,
      assertionsUntestableCount: 0,
      mustAssertionsPassedCount: 2,
      mustAssertionsCount: 3,
      mustAssertionsFailedCount: 1,
      mustAssertionsUntestableCount: 0,
      shouldAssertionsPassedCount: 2,
      shouldAssertionsCount: 2,
      shouldAssertionsFailedCount: 0,
      shouldAssertionsUntestableCount: 0,
      mayAssertionsPassedCount: 0,
      mayAssertionsCount: 1,
      mayAssertionsFailedCount: 1,
      mayAssertionsUntestableCount: 0,
      testsPassedCount: 0,
      testsCount: 1,
      testsFailedCount: 1,
      negativeSideEffectCount: 0,
      severeImpactPassedAssertionCount: 1,
      severeImpactFailedAssertionCount: 0,
      moderateImpactPassedAssertionCount: 1,
      moderateImpactFailedAssertionCount: 0,
      commandsCount: 1,
      ariaFeaturesPassedCount: 1,
      ariaFeaturesCount: 1,
      ariaFeaturesFailedCount: 0,
      ariaFeaturesUntestableCount: 0,
      htmlFeaturesPassedCount: 1,
      htmlFeaturesCount: 2,
      htmlFeaturesFailedCount: 1,
      htmlFeaturesUntestableCount: 0,
      mustFormatted: '2 of 3 passed',
      shouldFormatted: '2 of 2 passed',
      mayFormatted: '0 of 1 supported',
      negativeSideEffectsFormatted: false,
      ariaFeaturesFormatted: '100% of passing',
      htmlFeaturesFormatted: '50% of passing',
      ariaFeatures: [
        {
          refId: 'aria-expanded',
          type: 'aria',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 1,
          failed: 0,
          untestable: 0,
          passedPercentage: 100,
          formatted: '100% of passing'
        }
      ],
      htmlFeatures: [
        {
          refId: 'button',
          type: 'htmlAam',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 1,
          failed: 0,
          untestable: 0,
          passedPercentage: 100,
          formatted: '100% of passing'
        },
        {
          refId: 'input',
          type: 'htmlAam',
          linkText: undefined,
          value: undefined,
          rawLinkText: '',
          rawValue: '',
          total: 1,
          passed: 0,
          failed: 1,
          untestable: 0,
          passedPercentage: 0,
          formatted: '0% of passing'
        }
      ],
      supportLevel: 'FAILING',
      supportPercent: 80
    });
  });
});
