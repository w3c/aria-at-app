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
  } = await populateData({ testResultId }, { transaction });

  // The populateData function will populate associations of JSON-based
  // models, but not Sequelize-based models. This is why the
  // convertTestResultToInput function is needed to make testResultPopulated
  // equivalent to testPlanRun.testResults.
  const oldTestResults = testPlanRun.testResults;
  const oldTestResult = convertTestResultToInput(testResultPopulated);

  const newTestResult = deepCustomMerge(oldTestResult, input, {
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
      excludeKeys: ['unexpectedBehaviors']
    }
  );
  if (isCorrupted) {
    throw new UserInputError(
      'Data was received in an unexpected shape, it must match the ' +
        'format provided by the findOrCreateTestResult mutation.'
    );
  }

  if (isSubmit) {
    assertTestResultIsValid(newTestResult);
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

  if (isSubmit) {
    // Update metrics when result is saved
    const { testPlanReport: testPlanReportPopulated } = await populateData(
      { testPlanReportId: testPlanReport.id },
      { transaction }
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
  return populateData({ testResultId }, { transaction });
};

const assertTestResultIsValid = newTestResult => {
  let failed = false;

  const checkAssertionResult = assertionResult => {
    if (
      assertionResult.passed === null ||
      assertionResult.passed === undefined
    ) {
      failed = true;
    }
  };

  const checkUnexpectedBehavior = unexpectedBehavior => {
    const { impact, details } = unexpectedBehavior;
    if (!impact || !details) failed = true;
  };

  const checkScenarioResult = scenarioResult => {
    if (!scenarioResult.output || !scenarioResult.unexpectedBehaviors) {
      failed = true;
    }
    scenarioResult.assertionResults.forEach(checkAssertionResult);
    scenarioResult.unexpectedBehaviors?.forEach(checkUnexpectedBehavior);
  };

  newTestResult.scenarioResults.forEach(checkScenarioResult);

  if (failed) {
    throw new Error('Invalid Test Result');
  }
};

module.exports = saveTestResultCommon;
