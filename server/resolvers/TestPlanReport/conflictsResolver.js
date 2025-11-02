const { pick, omit } = require('lodash');
const testResultsResolver = require('../TestPlanRun/testResultsResolver');
const populateData = require('../../services/PopulatedData/populateData');
const allEqual = require('../../util/allEqual');
const {
  hasExceptionWithPriority
} = require('../../util/hasExceptionWithPriority');

const conflictsResolver = async (testPlanReport, _, context) => {
  let testPlanReportData = {};

  // Used in cases where the testPlanRuns to evaluate the conflicts doesn't
  // exist for `testPlanReport`, such as this function being called from
  // `conflictsLengthResolver.js`
  if (testPlanReport.testPlanRuns.some(t => !t.testResults)) {
    const { testPlanReport: _testPlanReport } = await populateData(
      { testPlanReportId: testPlanReport.id },
      { context }
    );
    testPlanReportData = _testPlanReport;
  } else testPlanReportData = testPlanReport;

  const conflicts = [];

  const testResultsByTestId = {};
  for (const testPlanRun of testPlanReportData.testPlanRuns) {
    testPlanRun.testPlanReport = testPlanReportData; // TODO: remove hacky fix
    const testResults = await testResultsResolver(testPlanRun, null, context);
    testResults
      .filter(testResult => testResult.completedAt)
      .forEach(testResult => {
        if (!testResultsByTestId[testResult.testId]) {
          testResultsByTestId[testResult.testId] = [];
        }
        testResultsByTestId[testResult.testId].push(testResult);
      });
  }

  Object.values(testResultsByTestId).forEach(testResults => {
    // See GraphQL TestPlanReportConflict for more info about how the
    // conflicts are formatted
    const conflictDetected = ({ i, j }) => {
      if (j != null) {
        const oneScenarioResult = testResults[0].scenarioResults[i];
        const { scenarioId, assertionResults } = oneScenarioResult;
        const { assertionId } = assertionResults[j];
        conflicts.push({
          source: { scenarioId, assertionId },
          conflictingResults: testResults.map(testResult => ({
            assertionResultId:
              testResult.scenarioResults[i].assertionResults[j].id
          }))
        });
      } else {
        const { scenarioId } = testResults[0].scenarioResults[i];
        conflicts.push({
          source: { scenarioId },
          conflictingResults: testResults.map(testResult => ({
            scenarioResultId: testResult.scenarioResults[i].id
          }))
        });
      }
    };

    if (testResults.length <= 1) return; // Nothing to compare

    for (let i = 0; i < testResults[0].scenarioResults.length; i += 1) {
      const scenarioResultComparisons = testResults.map(testResult => {
        // Note that output is not considered
        let picked = pick(testResult.scenarioResults[i], [
          'negativeSideEffects'
        ]);

        // Ignore negativeSideEffect details text during comparison of conflicts
        picked.negativeSideEffects = picked.negativeSideEffects.map(
          negativeSideEffect => omit(negativeSideEffect, ['details'])
        );

        return picked;
      });
      if (!allEqual(scenarioResultComparisons)) {
        conflictDetected({ i });
      }

      for (
        let j = 0;
        j < testResults[0].scenarioResults[i].assertionResults.length;
        j += 1
      ) {
        // Ignore assertions with EXCLUDE priority
        const representativeScenarioResult = testResults[0].scenarioResults[i];
        const representativeAssertionResult =
          representativeScenarioResult.assertionResults[j];
        const isExcluded =
          representativeAssertionResult.assertion?.priority === 'EXCLUDE' ||
          hasExceptionWithPriority(
            representativeAssertionResult.assertion,
            representativeScenarioResult.scenario,
            'EXCLUDE'
          );
        if (isExcluded) continue;

        const untestableResultComparisons = testResults.map(testResult => {
          return testResult.scenarioResults[i]?.untestable
            ? pick(testResult.scenarioResults[i], ['untestable'])
            : null;
        });
        const assertionResultComparisons = testResults.map(testResult =>
          pick(testResult.scenarioResults[i].assertionResults[j], ['passed'])
        );

        // The untestable conflicts should be represented as assertionResults
        // conflicts
        if (!allEqual(untestableResultComparisons)) {
          conflictDetected({ i, j });
        } else if (!allEqual(assertionResultComparisons)) {
          conflictDetected({ i, j });
        }
      }
    }
  });

  const preloaded = { testPlanReport: testPlanReportData };

  return Promise.all(
    conflicts.map(async ({ source, conflictingResults }) => ({
      source: await populateData(source, { preloaded, context }),
      conflictingResults: await Promise.all(
        conflictingResults.map(conflictingResult =>
          populateData(conflictingResult, { preloaded, context })
        )
      )
    }))
  );
};

module.exports = conflictsResolver;
