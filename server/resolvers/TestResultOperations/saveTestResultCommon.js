const { UserInputError } = require('apollo-server');
const {
  updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const deepCustomMerge = require('../../util/deepCustomMerge');
const deepPickEqual = require('../../util/deepPickEqual');
const convertTestResultToInput = require('../TestPlanRunOperations/convertTestResultToInput');
const createTestResultSkeleton = require('../TestPlanRunOperations/createTestResultSkeleton');
const persistConflictsCount = require('../helpers/persistConflictsCount');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const { getMetrics } = require('shared');
const {
  updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const { updatePercentComplete } = require('../../util/updatePercentComplete');
const {
  bulkCreateNegativeSideEffects,
  getNegativeSideEffectsByTestPlanRunId
} = require('../../models/services/NegativeSideEffectService');

/**
 * Creates negative side effects in the database for a test result
 * @param {Object} options
 * @param {number} options.testPlanRunId - TestPlanRun ID
 * @param {Object} options.testResult - Test result object
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 */
const createNegativeSideEffectsForTestResult = async ({
  testPlanRunId,
  testResult,
  transaction
}) => {
  try {
    // Get existing negative side effects for this test plan run
    const existingNegativeSideEffects =
      await getNegativeSideEffectsByTestPlanRunId({
        testPlanRunId,
        transaction
      });

    // Create a set of existing negative side effect IDs for efficient lookup
    const existingIds = new Set(
      existingNegativeSideEffects.map(
        nse =>
          `${nse.testResultId}_${nse.scenarioResultId}_${nse.negativeSideEffectId}`
      )
    );

    const negativeSideEffectsData = [];

    // Process each scenario result
    if (
      testResult.scenarioResults &&
      Array.isArray(testResult.scenarioResults)
    ) {
      for (const scenarioResult of testResult.scenarioResults) {
        if (
          scenarioResult.negativeSideEffects &&
          Array.isArray(scenarioResult.negativeSideEffects)
        ) {
          for (const negativeSideEffect of scenarioResult.negativeSideEffects) {
            const uniqueId = `${testResult.id}_${scenarioResult.id}_${negativeSideEffect.id}`;

            // Only create if it doesn't already exist
            if (!existingIds.has(uniqueId)) {
              negativeSideEffectsData.push({
                testPlanRunId,
                testResultId: testResult.id,
                scenarioResultId: scenarioResult.id,
                negativeSideEffectId: negativeSideEffect.id,
                impact: negativeSideEffect.impact || 'MODERATE',
                details: negativeSideEffect.details || null,
                highlightRequired:
                  negativeSideEffect.highlightRequired || false,
                encodedId: `${testPlanRunId}-${testResult.id}-${scenarioResult.id}-${negativeSideEffect.id}`,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
        }
      }
    }

    // Bulk create negative side effects if any were found
    if (negativeSideEffectsData.length > 0) {
      try {
        await bulkCreateNegativeSideEffects({
          negativeSideEffectsData,
          transaction
        });
      } catch (error) {
        // Handle unique constraint violations gracefully
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.warn(
            'Some negative side effects already exist, skipping duplicates:',
            error.message
          );
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error creating negative side effects:', error);
    // Don't throw - this is a non-critical operation
  }
};

const saveTestResultCommon = async ({
  testResultId,
  input,
  isSubmit,
  context
}) => {
  const { transaction } = context;

  const {
    testPlanRun,
    testPlanReport,
    test,
    testResult: testResultPopulated
  } = await populateData({ testResultId }, { context });

  // The populateData function will populate associations of JSON-based
  // models, but not Sequelize-based models. This is why the
  // convertTestResultToInput function is needed to make testResultPopulated
  // equivalent to testPlanRun.testResults.
  const oldTestResults = testPlanRun.testResults;
  const oldTestResult = convertTestResultToInput(testResultPopulated);

  // Normalize negativeSideEffects to handle type mismatches while preserving null state
  const normalizedInput = {
    ...input,
    scenarioResults: input.scenarioResults?.map(scenarioResult => ({
      ...scenarioResult,
      negativeSideEffects:
        scenarioResult.negativeSideEffects === undefined
          ? null
          : scenarioResult.negativeSideEffects
    }))
  };

  const newTestResult = deepCustomMerge(oldTestResult, normalizedInput, {
    identifyArrayItem: item => item.id,
    removeArrayItems: true
  });

  const isCorrupted = !deepPickEqual(
    [
      createTestResultSkeleton({ test, testPlanRun, testPlanReport }),
      newTestResult
    ],
    {
      pickKeys: ['id', 'testId', 'scenarioId', 'assertionId'],
      excludeKeys: ['negativeSideEffects']
    }
  );
  if (isCorrupted) {
    throw new UserInputError(
      'Data was received in an unexpected shape, it must match the ' +
        'format provided by the findOrCreateTestResult mutation.'
    );
  }

  if (isSubmit) {
    assertTestResultIsValid(newTestResult, test.assertions);
    newTestResult.completedAt = new Date();
  } else {
    newTestResult.completedAt = null;
  }

  const index = oldTestResults.findIndex(each => each.id === testResultId);
  const newTestResults = [
    ...oldTestResults.slice(0, index),
    newTestResult,
    ...oldTestResults.slice(index + 1)
  ];

  await updateTestPlanRunById({
    id: testPlanRun.id,
    values: { testResults: newTestResults },
    transaction
  });

  await updatePercentComplete({
    testPlanReportId: testPlanReport.id,
    transaction
  });

  // Create negative side effects in the database when test results are saved
  await createNegativeSideEffectsForTestResult({
    testPlanRunId: testPlanRun.id,
    testResult: newTestResult,
    transaction
  });

  if (isSubmit) {
    // Update metrics when result is saved
    const { testPlanReport: testPlanReportPopulated } = await populateData(
      { testPlanReportId: testPlanReport.id },
      { context }
    );
    const runnableTests = runnableTestsResolver(
      testPlanReportPopulated,
      null,
      context
    );
    const finalizedTestResults = await finalizedTestResultsResolver(
      testPlanReportPopulated,
      null,
      context
    );
    const metrics = getMetrics({
      testPlanReport: {
        ...testPlanReportPopulated,
        finalizedTestResults,
        runnableTests
      }
    });
    await updateTestPlanReportById({
      id: testPlanReportPopulated.id,
      values: {
        metrics: { ...testPlanReportPopulated.metrics, ...metrics }
      },
      transaction
    });
  }

  await persistConflictsCount(testPlanRun, context);
  return populateData({ testResultId }, { context });
};

const assertTestResultIsValid = (newTestResult, assertions = []) => {
  let failed = false;

  const checkAssertionResult = assertionResult => {
    const isExcluded = assertions.find(
      assertion =>
        assertion.id === assertionResult.assertionId &&
        assertion.priority === 'EXCLUDE'
    );

    if (
      assertionResult.passed === null ||
      assertionResult.passed === undefined
    ) {
      if (isExcluded) assertionResult.passed = false;
      else failed = true;
    }
  };

  const checkNegativeSideEffect = negativeSideEffect => {
    const { impact, details } = negativeSideEffect;
    if (!impact || !details) failed = true;
  };

  const checkScenarioResult = scenarioResult => {
    if (!scenarioResult.output || !scenarioResult.negativeSideEffects) {
      failed = true;
    }
    scenarioResult.assertionResults.forEach(checkAssertionResult);
    scenarioResult.negativeSideEffects?.forEach(checkNegativeSideEffect);
  };

  newTestResult.scenarioResults.forEach(checkScenarioResult);

  if (failed) {
    throw new Error('Invalid Test Result');
  }
};

module.exports = saveTestResultCommon;
