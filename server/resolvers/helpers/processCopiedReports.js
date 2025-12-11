const {
  getTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const {
  getTestPlanReports,
  updateTestPlanReportById,
  getOrCreateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const {
  getReviewerStatuses,
  createReviewerStatus,
  getReviewerStatusById
} = require('../../models/services/ReviewerStatusService');
const { hashTest } = require('../../util/aria');
const {
  createTestPlanRun,
  updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const createTestResultSkeleton = require('../TestPlanRunOperations/createTestResultSkeleton');
const populateData = require('../../services/PopulatedData/populateData');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const { getMetrics } = require('shared');
const { updatePercentComplete } = require('../../util/updatePercentComplete');

/**
 * Returns lists of known scenario and command ids for a test plan version's test
 * @param testPlanVersionTest
 * @returns {[string[],string[]]}
 */
const getKnownScenariosAndCommandIdsForTest = testPlanVersionTest => {
  const knownAssertionIdsForTest = [];
  const knownScenarioIdsForTest = [];

  for (const testPlanVersionAssertion of testPlanVersionTest.assertions) {
    const { text, rawAssertionId } = testPlanVersionAssertion;
    // `rawAssertionId` in v2 test format, otherwise `text` in v1 test format
    knownAssertionIdsForTest.push(rawAssertionId || text);
  }

  for (const testPlanVersionScenario of testPlanVersionTest.scenarios) {
    const { commandIds, atId, settings } = testPlanVersionScenario;
    let scenarioId = commandIds.join('-');
    scenarioId = `${scenarioId}_${atId}`;

    // settings may not exist if v1 test format
    if (settings) scenarioId = `${scenarioId}_${settings}`;
    knownScenarioIdsForTest.push(scenarioId);
  }

  return [knownScenarioIdsForTest, knownAssertionIdsForTest];
};

/**
 * Identifies unchanged tests between two TestPlanVersions via hash comparison.
 * Hashes each new test and matches against old tests using forUpdateCompare mode.
 * Returns mapping with test IDs and known scenario/assertion IDs for result preservation.
 *
 * @param {Object} oldTestPlanVersion - Source TestPlanVersion
 * @param {Object} newTestPlanVersion - Destination TestPlanVersion
 * @returns {Object.<string, Object>} Hash → {newTestId, oldTestId, known scenario/assertion IDs}
 */
const getKeptTestsByTestHash = (oldTestPlanVersion, newTestPlanVersion) => {
  const updateOptions = { forUpdateCompare: true };
  const keptTestsByTestHash = {};

  for (const newTestPlanVersionTest of newTestPlanVersion.tests) {
    const newTestPlanVersionTestHash = hashTest(
      {
        ...newTestPlanVersionTest,
        rowNumber: String(newTestPlanVersionTest.rowNumber)
      },
      updateOptions
    );

    // Move to the next loop if the test hash is already being tracked
    if (keptTestsByTestHash[newTestPlanVersionTestHash]) continue;

    for (const oldTestPlanVersionTest of oldTestPlanVersion.tests) {
      const oldTestPlanVersionTestHash = hashTest(
        {
          ...oldTestPlanVersionTest,
          rowNumber: String(oldTestPlanVersionTest.rowNumber)
        },
        updateOptions
      );

      // Move to the next loop if the hashes don't match
      if (newTestPlanVersionTestHash !== oldTestPlanVersionTestHash) continue;

      // For each command and/or assertion under the test, will use to check if there is a
      // matching command and/or assertion. If there is a match, preserve the previous result,
      // otherwise mark the test as not being complete
      const [knownScenarioIdsForOldTest, knownAssertionIdsForOldTest] =
        getKnownScenariosAndCommandIdsForTest(oldTestPlanVersionTest);
      const [knownScenarioIdsForNewTest, knownAssertionIdsForNewTest] =
        getKnownScenariosAndCommandIdsForTest(newTestPlanVersionTest);

      keptTestsByTestHash[newTestPlanVersionTestHash] = {
        newTestPlanVersionTestId: newTestPlanVersionTest.id,
        oldTestPlanVersionTestId: oldTestPlanVersionTest.id,
        knownScenarioIdsForOldTest,
        knownAssertionIdsForOldTest,
        knownScenarioIdsForNewTest,
        knownAssertionIdsForNewTest
      };
    }
  }

  return keptTestsByTestHash;
};

/**
 * Maps old test results to new test IDs for unchanged tests.
 * Checks each old result's testId against keptTestsByTestHash and creates mapping
 * with result data + known scenario/assertion IDs for granular preservation.
 *
 * @param {Array<Object>} testResults - Old TestPlanVersion test results
 * @param {Object.<string, Object>} keptTestsByTestHash - From getKeptTestsByTestHash
 * @returns {Object.<string, Object>} New testId → old result + known IDs
 */
const getKeptTestResultsByTestId = (testResults, keptTestsByTestHash) => {
  const keptTestResultsByTestId = {};
  for (const testResult of testResults) {
    // Check if the testId referenced also matches the hash on any in the
    // keptTestsByTestHash
    Object.keys(keptTestsByTestHash).forEach(key => {
      const {
        newTestPlanVersionTestId,
        oldTestPlanVersionTestId,
        knownAssertionIdsForOldTest,
        knownScenarioIdsForOldTest,
        knownAssertionIdsForNewTest,
        knownScenarioIdsForNewTest
      } = keptTestsByTestHash[key];

      if (oldTestPlanVersionTestId === testResult.testId) {
        // Then this data should be preserved
        keptTestResultsByTestId[newTestPlanVersionTestId] = {
          ...testResult,
          knownAssertionIdsForOldTest,
          knownScenarioIdsForOldTest,
          knownAssertionIdsForNewTest,
          knownScenarioIdsForNewTest
        };
      } else {
        // TODO: Return information on which tests cannot be preserved
      }
    });
  }

  return keptTestResultsByTestId;
};

/**
 * Recalculates metrics for a TestPlanReport after copying results.
 * Updates completion %, conflicts count, and nullifies markedFinalAt.
 * Priority: conflicts → no finalized results → full metrics.
 *
 * @param {Object} params
 * @param {Object} params.newTestPlanReport - TestPlanReport receiving results
 * @param {Object} params.testPlanRun - TestPlanRun with copied results
 * @param {Array<Object>} params.testResults - Copied test results
 * @param {Object} params.context - GraphQL context
 * @param {Object} params.transaction - DB transaction
 * @returns {Promise<void>}
 */
const updateMetricsAndMarkedFinalAtForTestPlanReport = async ({
  newTestPlanReport,
  testPlanRun,
  testResults,
  context,
  transaction
}) => {
  await updateTestPlanRunById({
    id: testPlanRun.id,
    values: { testResults },
    transaction
  });

  await updatePercentComplete({
    testPlanReportId: newTestPlanReport.id,
    transaction
  });

  // Update metrics for TestPlanReport
  const { testPlanReport: populatedTestPlanReport } = await populateData(
    { testPlanReportId: newTestPlanReport.id },
    { context }
  );

  const runnableTests = runnableTestsResolver(
    populatedTestPlanReport,
    null,
    context
  );

  // Even if oldTestPlanReport.markedFinalAt exists, it should be nullified
  // when copied over because it should be on the test admin(s) to ensure
  // the copied data isn't incorrect in certain instances or needs to be
  // updated before finalizing again
  let updateParams = { markedFinalAt: null };

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
};

/**
 * Copies test results from old TestPlanVersion to new when tests haven't changed.
 * Uses hash comparison to identify unchanged tests, preserves outputs/assertions/vendor statuses.
 * Handles partial changes by nullifying completedAt. Skips bots. Recalculates metrics.
 * Resets markedFinalAt and vendor approvals if any scenarios/assertions couldn't be preserved.
 *
 * @param {Object} params
 * @param {string} params.oldTestPlanVersionId - Source version ID
 * @param {string} params.newTestPlanVersionId - Destination version ID
 * @param {Array<Object>} params.newTestPlanReports - Existing reports (avoid duplicates)
 * @param {Array<Object>} [params.atBrowserCombinationsToInclude=[]] - Optional AT/Browser filter
 * @param {Object} params.context - GraphQL context with transaction
 * @returns {Promise<Object>} {oldTestPlanVersion, newTestPlanReportIds, updatedTestPlanReports}
 */
const processCopiedReports = async ({
  oldTestPlanVersionId,
  newTestPlanVersionId,
  newTestPlanReports,
  atBrowserCombinationsToInclude = [],
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
      oldTestPlanVersion,
      newTestPlanReportIds,
      updatedTestPlanReports
    };
  }

  const atBrowserStringCombinations = atBrowserCombinationsToInclude.map(
    ({ atId, browserId }) => `${atId}_${browserId}`
  );

  // If there is an earlier version that for this phase and that version has some test plan runs
  // in the test queue, this will run the process for updating existing test plan versions for the
  // test plan version and preserving data for tests that have not changed.
  for (const oldTestPlanReport of oldTestPlanReports) {
    // Verify an existing combination for the TestPlanVersion being updated to, does not already
    // exist
    if (
      newTestPlanReports.some(
        ({ atId, browserId }) =>
          atId === oldTestPlanReport.atId &&
          browserId === oldTestPlanReport.browserId
      )
    ) {
      continue;
    }

    if (
      atBrowserStringCombinations.length &&
      !atBrowserStringCombinations.find(
        combination =>
          combination ===
          `${oldTestPlanReport.atId}_${oldTestPlanReport.browserId}`
      )
    ) {
      continue;
    }

    // Then the combination needs to be considered if the tests are not different
    // between versions
    const keptTestsByTestHash = getKeptTestsByTestHash(
      oldTestPlanVersion,
      newTestPlanVersion
    );

    const newReviewerStatusViewedTestsToSave = [];
    const oldReviewerStatuses = await getReviewerStatuses({
      where: { testPlanReportId: oldTestPlanReport.id },
      transaction
    });
    const oldVendorViewedTests = oldReviewerStatuses.flatMap(
      ({ viewedTests }) => viewedTests
    );

    for (const oldTestPlanRun of oldTestPlanReport.testPlanRuns) {
      // Don't create a new test plan run if previous run was for a bot to avoid unexpected assignment results
      // Bot assignments orchestrated and controlled by separate system
      const isBotIdRegex = /^9\d{3}$/; // Currently, user ids for bots are in the format '9XXX'
      if (isBotIdRegex.test(oldTestPlanRun.testerUserId)) continue;

      // Keep track if previous vendor approval status should be carried over
      let shouldSaveReviewerStatus = true;

      // Track which old test results need to be preserved
      const keptTestResultsByTestId = getKeptTestResultsByTestId(
        oldTestPlanRun.testResults,
        keptTestsByTestHash
      );

      if (!Object.keys(keptTestResultsByTestId).length) continue;

      // Create (or get) the new test plan report the results will be copied to
      const [newTestPlanReport] = await getOrCreateTestPlanReport({
        where: {
          testPlanVersionId: newTestPlanVersionId,
          atId: oldTestPlanReport.atId,
          minimumAtVersionId: oldTestPlanReport.minimumAtVersionId,
          exactAtVersionId: oldTestPlanReport.exactAtVersionId,
          browserId: oldTestPlanReport.browserId
        },
        transaction
      });
      newTestPlanReportIds.push(newTestPlanReport.id);

      // Create the new test plan run for a previous assigned tester so old results can be
      // copied to it
      const newTestPlanRun = await createTestPlanRun({
        values: {
          testerUserId: oldTestPlanRun.testerUserId,
          testPlanReportId: newTestPlanReport.id,
          isAutomated: oldTestPlanRun.initiatedByAutomation
        },
        transaction
      });
      const newTestResults = [];

      for (const testResultToSaveTestId of Object.keys(
        keptTestResultsByTestId
      )) {
        const oldTestResult = keptTestResultsByTestId[testResultToSaveTestId];
        const {
          knownAssertionIdsForOldTest,
          knownScenarioIdsForOldTest,
          knownAssertionIdsForNewTest,
          knownScenarioIdsForNewTest
        } = oldTestResult;

        const { test } = await populateData(
          { testId: testResultToSaveTestId },
          { context }
        );
        const { test: oldTest } = await populateData(
          { testResultId: oldTestResult.id },
          { context }
        );

        // Re-run createTestResultSkeleton to avoid unexpected scenario index matching issues when saving
        // future results; override newly generated test results with old results if exists
        let newTestResult = createTestResultSkeleton({
          test,
          testPlanRun: newTestPlanRun,
          testPlanReport: newTestPlanReport,
          atVersionId: oldTestResult.atVersionId,
          browserVersionId: oldTestResult.browserVersionId
        });
        newTestResult.completedAt = oldTestResult.completedAt;

        const scenarioResultsByScenarioIds = {};
        knownScenarioIdsForOldTest.forEach((id, index) => {
          scenarioResultsByScenarioIds[id] =
            oldTestResult.scenarioResults[index];
        });

        // Preserve output and negativeSideEffects for each scenario if matching old result
        for (let [
          scenarioIndex,
          eachScenarioResult
        ] of newTestResult.scenarioResults.entries()) {
          const rawScenarioId = knownScenarioIdsForNewTest[scenarioIndex];

          // Unknown combination of command + settings when compared with last version
          const oldScenarioResult = scenarioResultsByScenarioIds[rawScenarioId];
          if (!oldScenarioResult) {
            shouldSaveReviewerStatus = false;
            newTestResult.completedAt = null;
            continue;
          }

          eachScenarioResult.output = oldScenarioResult.output;
          eachScenarioResult.untestable = oldScenarioResult.untestable;
          eachScenarioResult.negativeSideEffects =
            oldScenarioResult.negativeSideEffects;

          const assertionResultsByAssertionIds = {};
          knownAssertionIdsForOldTest.forEach((id, index) => {
            assertionResultsByAssertionIds[id] =
              oldScenarioResult.assertionResults[index];
          });

          // Preserve passed status for each assertion if matching old result
          for (let [
            assertionIndex,
            eachAssertionResult
          ] of eachScenarioResult.assertionResults.entries()) {
            const rawAssertionId = knownAssertionIdsForNewTest[assertionIndex];

            // Unknown assertion when compared with last version
            const oldAssertionResult =
              assertionResultsByAssertionIds[rawAssertionId];
            if (!oldAssertionResult) {
              shouldSaveReviewerStatus = false;
              newTestResult.completedAt = null;
              continue;
            }
            eachAssertionResult.passed = oldAssertionResult.passed;
          }
        }
        newTestResults.push(newTestResult);

        // Keep track of vendor viewed tests to carry over
        if (
          shouldSaveReviewerStatus &&
          oldVendorViewedTests.includes(oldTest.id) &&
          !newReviewerStatusViewedTestsToSave.includes(
            `${oldTest.id}:${test.id}`
          )
        ) {
          newReviewerStatusViewedTestsToSave.push(`${oldTest.id}:${test.id}`);
        }
      }

      // Run updated metrics calculations for new TestPlanRun test results to be used in metrics calculations
      await updateMetricsAndMarkedFinalAtForTestPlanReport({
        newTestPlanReport,
        testPlanRun: newTestPlanRun,
        testResults: newTestResults,
        context,
        transaction
      });

      for (const oldReviewerStatus of oldReviewerStatuses) {
        let newReviewerStatusExists;

        try {
          newReviewerStatusExists = await getReviewerStatusById({
            testPlanReportId: newTestPlanReport.id,
            userId: oldReviewerStatus.userId,
            vendorId: oldReviewerStatus.vendorId,
            transaction
          });
        } catch (error) {
          console.error(
            `Unable to query for reviewerStatus: { ${newTestPlanReport.id},${oldReviewerStatus.userId},${oldReviewerStatus.vendorId} }`,
            error
          );
        }

        if (newReviewerStatusExists) continue;

        const viewedTests = [];
        newReviewerStatusViewedTestsToSave.forEach(oldNewViewedTest => {
          const [oldTestId, newTestId] = oldNewViewedTest.split(':');
          if (oldReviewerStatus.viewedTests.includes(oldTestId))
            viewedTests.push(newTestId);
        });

        try {
          await createReviewerStatus({
            values: {
              testPlanReportId: newTestPlanReport.id,
              userId: oldReviewerStatus.userId,
              vendorId: oldReviewerStatus.vendorId,
              reviewStatus: shouldSaveReviewerStatus
                ? oldReviewerStatus.reviewStatus
                : 'IN_PROGRESS',
              approvedAt:
                shouldSaveReviewerStatus &&
                oldReviewerStatus.reviewStatus === 'APPROVED'
                  ? new Date()
                  : null,
              viewedTests
            },
            transaction
          });
        } catch (error) {
          console.error(
            `Unable to create reviewerStatus: { ${newTestPlanReport.id},${oldReviewerStatus.userId},${oldReviewerStatus.vendorId} }`,
            error
          );
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
    oldTestPlanVersion,
    newTestPlanReportIds,
    updatedTestPlanReports: atBrowserStringCombinations.length
      ? updatedTestPlanReports.filter(({ atId, browserId }) =>
          atBrowserStringCombinations.includes(`${atId}_${browserId}`)
        )
      : updatedTestPlanReports
  };
};

module.exports = processCopiedReports;
