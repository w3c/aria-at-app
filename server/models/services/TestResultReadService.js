const negativeSideEffectsJson = require('../../resources/negativeSideEffects.json');
const getTests = require('./TestsService');
const deepCustomMerge = require('../../util/deepCustomMerge');
const {
  getNegativeSideEffectsByTestPlanRunId
} = require('./NegativeSideEffectService');

/**
 * Returns an array of test results with nested test, atVersion, browserVersion,
 * scenario, assertion and negativeSideEffect fields populated.
 * @param {Object} testPlanRun
 * @param {Object} testPlanRun.testPlanReport
 * @param {Object[]} testPlanRun.testResults
 * @param {Object} context
 * @param {*} context.browserLoader
 * @param {*} context.atLoader
 * @param {*} context.transaction - Sequelize transaction
 * @returns {Promise<Object[]>}
 */
const getTestResults = async ({ testPlanRun, context }) => {
  const { atLoader, browserLoader, transaction } = context;

  const { testPlanReport } = testPlanRun;
  const tests = await getTests(testPlanRun);
  const ats = await atLoader.getAll({ transaction });
  const browsers = await browserLoader.getAll({ transaction });

  // Try to get negative side effects from the database first
  let negativeSideEffectsFromDb = [];
  try {
    // Only attempt database lookup if testPlanRunId is valid
    if (testPlanRun.id && typeof testPlanRun.id === 'number') {
      negativeSideEffectsFromDb = await getNegativeSideEffectsByTestPlanRunId({
        testPlanRunId: testPlanRun.id,
        transaction
      });
    }
  } catch (error) {
    // Fall back to JSONB if database lookup fails
    console.warn(
      'Failed to fetch negative side effects from database, falling back to JSONB:',
      error.message
    );
  }

  // Create a map of negative side effects by scenario result ID for efficient lookup
  const negativeSideEffectsByScenarioId = {};
  negativeSideEffectsFromDb.forEach(nse => {
    if (!negativeSideEffectsByScenarioId[nse.scenarioResultId]) {
      negativeSideEffectsByScenarioId[nse.scenarioResultId] = [];
    }
    negativeSideEffectsByScenarioId[nse.scenarioResultId].push({
      id: nse.negativeSideEffectId,
      impact: nse.impact,
      details: nse.details,
      highlightRequired: nse.highlightRequired,
      encodedId: nse.encodedId,
      text: negativeSideEffectsJson.find(
        each => each.id === nse.negativeSideEffectId
      )?.text,
      atBugs: nse.atBugs || []
    });
  });

  // Populate nested test, atVersion, browserVersion, scenario, assertion and
  // negativeSideEffect fields
  return testPlanRun.testResults.map(testResult => {
    const test = tests.find(each => each.id === testResult.testId);
    return {
      ...testResult,
      test,
      atVersion: ats
        .find(at => at.id === testPlanReport.at.id)
        .atVersions.find(each => each.id == testResult.atVersionId),
      browserVersion: browsers
        .find(browser => browser.id === testPlanReport.browser.id)
        .browserVersions.find(each => each.id == testResult.browserVersionId),
      scenarioResults: testResult.scenarioResults.map(scenarioResult => {
        // Use database negative side effects if available, otherwise fall back to JSONB
        const negativeSideEffects =
          negativeSideEffectsByScenarioId[scenarioResult.id] ||
          (scenarioResult.negativeSideEffects?.length > 0
            ? scenarioResult.negativeSideEffects.map(negativeSideEffect => {
                const encodedId = `${testPlanRun.id}-${testResult.id}-${scenarioResult.id}-${negativeSideEffect.id}`;
                return {
                  ...negativeSideEffect,
                  encodedId,
                  text: negativeSideEffectsJson.find(
                    each => each.id === negativeSideEffect.id
                  )?.text,
                  atBugs: []
                };
              })
            : scenarioResult.negativeSideEffects);

        return {
          ...scenarioResult,
          scenario: test.scenarios.find(
            each => each.id === scenarioResult.scenarioId
          ),
          assertionResults: scenarioResult.assertionResults.map(
            assertionResult => ({
              ...assertionResult,
              assertion: test.assertions.find(
                each => each.id === assertionResult.assertionId
              )
            })
          ),
          negativeSideEffects
        };
      })
    };
  });
};

/**
 * Returns an array of finalized test results with nested test, atVersion,
 * browserVersion, scenario, assertion and negativeSideEffect fields populated.
 * @param {Object} testPlanReport
 * @param {Object[]} testPlanReport.testPlanRuns
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object[]>}
 */
const getFinalizedTestResults = ({ testPlanReport, context }) => {
  if (!testPlanReport.testPlanRuns.length) {
    return null;
  }

  let merged = [];

  for (let i = 0; i < testPlanReport.testPlanRuns.length; i += 1) {
    merged = deepCustomMerge(
      merged,
      testPlanReport.testPlanRuns[i].testResults.filter(
        testResult => !!testResult.completedAt
      ),
      {
        identifyArrayItem: item =>
          item.testId ?? item.scenarioId ?? item.assertionId
      }
    );
  }
  return getTestResults({
    testPlanRun: {
      testPlanReport,
      testResults: merged,
      id: testPlanReport.testPlanRuns[0]?.id // Use the first test plan run ID for encodedId generation
    },
    context
  });
};

module.exports = {
  getTestResults,
  getFinalizedTestResults
};
