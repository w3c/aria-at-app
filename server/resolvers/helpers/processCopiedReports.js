const {
  getTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const {
  getTestPlanReports,
  getOrCreateTestPlanReport,
  updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const {
  createTestResultId,
  createScenarioResultId,
  createAssertionResultId
} = require('../../services/PopulatedData/locationOfDataId');
const { hashTest } = require('../../util/aria');
const {
  createTestPlanRun,
  updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const { getMetrics } = require('shared');

const processCopiedReports = async ({
  oldTestPlanVersionId,
  newTestPlanVersionId,
  newTestPlanReports,
  context
}) => {
  const { transaction } = context;

  // The testPlanVersion being updated
  const newTestPlanVersion = await getTestPlanVersionById({
    id: newTestPlanVersionId,
    transaction
  });

  let oldTestPlanVersion;
  let oldTestPlanReports = [];
  let newTestPlanReportIds = [];
  let updatedTestPlanReports = null;

  // These checks are needed to support the test plan version reports being updated with earlier
  // versions' data
  if (oldTestPlanVersionId) {
    oldTestPlanVersion = await getTestPlanVersionById({
      id: oldTestPlanVersionId,
      transaction
    });

    oldTestPlanReports = await getTestPlanReports({
      where: { testPlanVersionId: oldTestPlanVersionId },
      testPlanReportAttributes: null,
      testPlanRunAttributes: null,
      testPlanVersionAttributes: null,
      testPlanAttributes: null,
      atAttributes: null,
      browserAttributes: null,
      userAttributes: null,
      pagination: { order: [['createdAt', 'desc']] },
      transaction
    });
  }

  // There is no older test plan reports to process
  if (!oldTestPlanReports.length) {
    return {
      newTestPlanReportIds,
      updatedTestPlanReports
    };
  }

  // If there is an earlier version that for this phase and that version has some test plan runs
  // in the test queue, this will run the process for updating existing test plan versions for the
  // test plan version and preserving data for tests that have not changed.
  const forUpdateCompare = true;

  for (const oldTestPlanReport of oldTestPlanReports) {
    // Verify the combination does not exist
    if (
      !newTestPlanReports.some(
        ({ atId, browserId }) =>
          atId === oldTestPlanReport.atId &&
          browserId === oldTestPlanReport.browserId
      )
    ) {
      // Then this combination needs to be considered if the tests are not different
      // between versions
      let keptTestIds = {};
      for (const newTestPlanVersionTest of newTestPlanVersion.tests) {
        // Found odd instances of rowNumber being an int instead of being how it
        // currently is; imported as a string
        // Ensuring proper hashes are done here
        const newTestPlanVersionTestHash = hashTest(
          {
            ...newTestPlanVersionTest,
            rowNumber: String(newTestPlanVersionTest.rowNumber)
          },
          { forUpdateCompare }
        );

        if (keptTestIds[newTestPlanVersionTestHash]) continue;

        for (const oldTestPlanVersionTest of oldTestPlanVersion.tests) {
          const oldTestPlanVersionTestHash = hashTest(
            {
              ...oldTestPlanVersionTest,
              rowNumber: String(oldTestPlanVersionTest.rowNumber)
            },
            { forUpdateCompare }
          );

          // For each assertion under the test, check if there is a matching
          // assertion. If the assertion matches, preserve the previous result,
          // otherwise mark the test as not being complete
          const knownAssertionIdsForOldTest = [];
          for (const oldTestPlanVersionAssertion of oldTestPlanVersionTest.assertions) {
            if (oldTestPlanVersionAssertion.rawAssertionId)
              knownAssertionIdsForOldTest.push(
                oldTestPlanVersionAssertion.rawAssertionId
              );
          }

          if (newTestPlanVersionTestHash === oldTestPlanVersionTestHash) {
            if (!keptTestIds[newTestPlanVersionTestHash])
              keptTestIds[newTestPlanVersionTestHash] = {
                newTestPlanVersionTestId: newTestPlanVersionTest.id,
                oldTestPlanVersionTestId: oldTestPlanVersionTest.id,
                knownAssertionIdsForOldTest
              };
          }
        }
      }

      for (const oldTestPlanRun of oldTestPlanReport.testPlanRuns) {
        const newTestResultsToSaveByTestId = {};
        for (const oldTestResult of oldTestPlanRun.testResults) {
          // Check if the testId referenced also matches the hash on any in the
          // keptTestIds
          Object.keys(keptTestIds).forEach(key => {
            const {
              newTestPlanVersionTestId,
              oldTestPlanVersionTestId,
              knownAssertionIdsForOldTest
            } = keptTestIds[key];

            if (oldTestPlanVersionTestId === oldTestResult.testId) {
              // Then this data should be preserved
              newTestResultsToSaveByTestId[newTestPlanVersionTestId] = {
                ...oldTestResult,
                knownAssertionIdsForOldTest
              };
            } else {
              // TODO: Return information on which tests cannot be preserved
            }
          });
        }

        if (Object.keys(newTestResultsToSaveByTestId).length) {
          const [newTestPlanReport] = await getOrCreateTestPlanReport({
            where: {
              testPlanVersionId: newTestPlanVersionId,
              atId: oldTestPlanReport.atId,
              browserId: oldTestPlanReport.browserId
            },
            transaction
          });

          newTestPlanReportIds.push(newTestPlanReport.id);

          const newTestPlanRun = await createTestPlanRun({
            values: {
              testerUserId: oldTestPlanRun.testerUserId,
              testPlanReportId: newTestPlanReport.id
            },
            transaction
          });

          const newTestResults = [];
          for (const testResultToSaveTestId of Object.keys(
            newTestResultsToSaveByTestId
          )) {
            const foundKeptNewTest = newTestPlanVersion.tests.find(
              test => test.id === testResultToSaveTestId
            );

            let newTestResult =
              newTestResultsToSaveByTestId[testResultToSaveTestId];

            const knownAssertionIdsForOldTest = [
              ...newTestResult.knownAssertionIdsForOldTest
            ];
            delete newTestResult.knownAssertionIdsForOldTest;

            // Updating testResult id references
            const newTestResultId = createTestResultId(
              newTestPlanRun.id,
              testResultToSaveTestId
            );

            newTestResult.testId = testResultToSaveTestId;
            newTestResult.id = newTestResultId;

            // The hash confirms the scenario (commands) arrays should be in the same
            // order, and regenerate the test result related ids for the carried
            // over data
            for (let [
              scenarioIndex,
              eachScenarioResult
            ] of newTestResult.scenarioResults.entries()) {
              eachScenarioResult.scenarioId = foundKeptNewTest.scenarios.filter(
                scenario => scenario.atId === oldTestPlanReport.atId
              )[scenarioIndex].id;

              // Update eachScenarioResult.id
              const scenarioResultId = createScenarioResultId(
                newTestResultId,
                eachScenarioResult.scenarioId
              );
              eachScenarioResult.id = scenarioResultId;

              for (let [
                assertionIndex,
                eachAssertionResult
              ] of eachScenarioResult.assertionResults.entries()) {
                eachAssertionResult.assertionId =
                  foundKeptNewTest.assertions[assertionIndex].id;

                // Update eachAssertionResult.id
                eachAssertionResult.id = createAssertionResultId(
                  scenarioResultId,
                  eachAssertionResult.assertionId
                );

                // Checks if rawAssertionId is persisted across TestPlanVersions
                // Nullify 'passed' and mark the test as not completed if it isn't
                if (
                  knownAssertionIdsForOldTest.length ===
                    foundKeptNewTest.assertions.length &&
                  knownAssertionIdsForOldTest[assertionIndex] !==
                    foundKeptNewTest.assertions[assertionIndex].rawAssertionId
                ) {
                  eachAssertionResult.passed = null;
                  newTestResult.completedAt = null;
                }
              }
            }

            newTestResults.push(newTestResult);
          }

          // Update TestPlanRun test results to be used in metrics evaluation
          // afterward
          await updateTestPlanRunById({
            id: newTestPlanRun.id,
            values: { testResults: newTestResults },
            transaction
          });

          // Update metrics for TestPlanReport
          const { testPlanReport: populatedTestPlanReport } =
            await populateData(
              { testPlanReportId: newTestPlanReport.id },
              { transaction }
            );

          const runnableTests = runnableTestsResolver(
            populatedTestPlanReport,
            null,
            context
          );
          let updateParams = {};

          // Mark the report as final if previously was for TestPlanVersion being deprecated; may still be
          // nullified if finalized test results aren't equal to the amount known number of possible
          // runnable tests, because no tests should be skipped. Would mean it CANNOT be final.
          if (oldTestPlanReport.markedFinalAt)
            updateParams = { markedFinalAt: new Date() };

          // Calculate the metrics (happens if updating to DRAFT)
          const conflicts = await conflictsResolver(
            populatedTestPlanReport,
            null,
            context
          );

          if (conflicts.length > 0) {
            // Then no chance to have finalized reports, and means it hasn't been
            // marked as final yet
            updateParams = {
              ...updateParams,
              markedFinalAt: null,
              metrics: {
                ...populatedTestPlanReport.metrics,
                conflictsCount: conflicts.length
              }
            };
          } else {
            const finalizedTestResults = await finalizedTestResultsResolver(
              populatedTestPlanReport,
              null,
              context
            );

            if (!finalizedTestResults || !finalizedTestResults.length) {
              updateParams = {
                ...updateParams,
                markedFinalAt: null,
                metrics: {
                  ...populatedTestPlanReport.metrics
                }
              };
            } else {
              const metrics = getMetrics({
                testPlanReport: {
                  ...populatedTestPlanReport,
                  finalizedTestResults,
                  runnableTests
                }
              });

              updateParams = {
                ...updateParams,
                // means test results have now been 'skipped' during the update process so these
                // cannot be finalized and must be updated in the test queue
                markedFinalAt:
                  finalizedTestResults.length < runnableTests.length
                    ? null
                    : updateParams.markedFinalAt,
                metrics: {
                  ...populatedTestPlanReport.metrics,
                  ...metrics
                }
              };
            }
          }

          await updateTestPlanReportById({
            id: populatedTestPlanReport.id,
            values: updateParams,
            transaction
          });
        }
      }
    }
  }

  updatedTestPlanReports = await getTestPlanReports({
    where: { testPlanVersionId: newTestPlanVersionId },
    testPlanRunAttributes: null,
    testPlanVersionAttributes: null,
    testPlanAttributes: null,
    userAttributes: null,
    pagination: { order: [['createdAt', 'desc']] },
    transaction
  });

  return {
    newTestPlanReportIds,
    updatedTestPlanReports
  };
};

module.exports = processCopiedReports;
