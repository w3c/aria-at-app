const axios = require('axios');
const {
  getCollectionJobById,
  updateCollectionJobById,
  updateCollectionJobTestStatusByQuery
} = require('../models/services/CollectionJobService');
const {
  findOrCreateTestResult
} = require('../models/services/TestResultWriteService');
const convertTestResultToInput = require('../resolvers/TestPlanRunOperations/convertTestResultToInput');
const saveTestResultCommon = require('../resolvers/TestResultOperations/saveTestResultCommon');
const {
  findOrCreateAtVersion
} = require('../models/services/AtVersionService');
const {
  promoteAutomationSupportedVersion
} = require('../models/services/AtVersionService');
const { getAts } = require('../models/services/AtService');
const {
  getBrowsers,
  findOrCreateBrowserVersion
} = require('../models/services/BrowserService');
const { HttpQueryError } = require('apollo-server-core');
const { COLLECTION_JOB_STATUS, isJobStatusFinal } = require('../util/enums');
const { EVENT_TYPES } = require('../util/eventTypes');
const { getTestResults } = require('../models/services/TestResultReadService');
const http = require('http');
const { NO_OUTPUT_STRING } = require('../util/constants');
const runnableTestsResolver = require('../resolvers/TestPlanReport/runnableTestsResolver');
const getGraphQLContext = require('../graphql-context');
const populateData = require('../services/PopulatedData/populateData');
const {
  getTestPlanReportById,
  updateTestPlanReportById
} = require('../models/services/TestPlanReportService');
const {
  getTestPlanVersionById
} = require('../models/services/TestPlanVersionService');
const { createEvent } = require('../models/services/EventService');
const { updatePercentComplete } = require('../util/updatePercentComplete');
const httpAgent = new http.Agent({ family: 4 });

const axiosConfig = {
  timeout: 1000,
  httpAgent
};

const throwNoJobFoundError = jobId => {
  throw new HttpQueryError(
    404,
    `Could not find job with jobId: ${jobId}`,
    true
  );
};

const throwNoTestFoundError = rowNumber => {
  throw new HttpQueryError(
    404,
    `Could not find test at row number ${rowNumber}`,
    true
  );
};

const throwSchedulerError = schedulerResponse => {
  throw new HttpQueryError(
    502,
    `Response scheduler did not give a correct response: ${schedulerResponse}`,
    false
  );
};

const cancelJob = async (req, res) => {
  const automationSchedulerResponse = await axios.post(
    `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${req.params.jobID}/cancel`,
    {},
    axiosConfig
  );

  if (!automationSchedulerResponse.data) {
    throwSchedulerError(automationSchedulerResponse);
  }

  if (
    automationSchedulerResponse.data.status === COLLECTION_JOB_STATUS.CANCELLED
  ) {
    const graphqlRes = await updateCollectionJobById({
      id: req.params.jobID,
      values: { status: COLLECTION_JOB_STATUS.CANCELLED },
      transaction: req.transaction
    });
    if (!graphqlRes) {
      throwNoJobFoundError(req.params.jobID);
    }
  }
  res.json(automationSchedulerResponse.data);
};

const updateJobStatus = async (req, res) => {
  const { status, externalLogsUrl } = req.body;

  if (!Object.values(COLLECTION_JOB_STATUS).includes(status)) {
    throw new HttpQueryError(400, `Invalid status: ${status}`, true);
  }

  const updatePayload = {
    status,
    ...(externalLogsUrl != null && { externalLogsUrl })
  };

  // When new status is considered "final" ('COMPLETED' or 'ERROR' or 'CANCELLED')
  if (isJobStatusFinal(status)) {
    // update any CollectionJobTestStatus children still 'QUEUED' to be 'CANCELLED'
    await updateCollectionJobTestStatusByQuery({
      where: {
        collectionJobId: req.params.jobID,
        status: COLLECTION_JOB_STATUS.QUEUED
      },
      values: { status: COLLECTION_JOB_STATUS.CANCELLED },
      transaction: req.transaction
    });
    // update any CollectionJobTestStatus children still 'RUNNING' to be 'ERROR' or 'CANCELLED'
    let runningTestNewStatus =
      status === COLLECTION_JOB_STATUS.ERROR
        ? COLLECTION_JOB_STATUS.ERROR
        : COLLECTION_JOB_STATUS.CANCELLED;
    await updateCollectionJobTestStatusByQuery({
      where: {
        collectionJobId: req.params.jobID,
        status: COLLECTION_JOB_STATUS.RUNNING
      },
      values: { status: runningTestNewStatus },
      transaction: req.transaction
    });
  }

  const graphqlResponse = await updateCollectionJobById({
    id: req.params.jobID,
    values: updatePayload,
    transaction: req.transaction
  });

  if (!graphqlResponse) {
    throwNoJobFoundError(req.params.jobID);
  }

  res.json(graphqlResponse);
};

// TODO: Remove if getFinalizedTestResults and finalizedTestResultsResolver are unified
// Use the same logic as finalizedTestResultsResolver - only use primary test plan run
const getPrimaryTestPlanRun = testPlanReport => {
  return (
    testPlanReport.testPlanRuns.find(({ isPrimary }) => isPrimary) ||
    testPlanReport.testPlanRuns.find(testPlanRun =>
      testPlanRun.testResults?.some(testResult => !!testResult.completedAt)
    ) ||
    testPlanReport.testPlanRuns[0]
  );
};

const getApprovedFinalizedTestResults = async (testPlanRun, context) => {
  const { testPlanReport } = await populateData(
    { testPlanReportId: testPlanRun.testPlanReport.id },
    { context }
  );

  // If the current report is finalized
  // Use the finalized test results (from another run)
  if (testPlanReport.markedFinalAt !== null) {
    if (!testPlanReport.testPlanRuns.length) {
      return null;
    }

    const testPlanRun = getPrimaryTestPlanRun(testPlanReport);

    const testResults = testPlanRun.testResults.filter(
      testResult => !!testResult.completedAt
    );

    return getTestResults({
      testPlanRun: { testPlanReport, testResults },
      context
    });
  }

  return null;
};

const getTestByRowNumber = async ({ testPlanRun, testRowNumber, context }) => {
  const tests = await runnableTestsResolver(
    testPlanRun.testPlanReport,
    null,
    context
  );
  return tests.find(test => String(test.rowNumber) === String(testRowNumber));
};

const updateOrCreateTestResultWithResponses = async ({
  testId,
  testPlanRun,
  responses,
  atVersionId,
  browserVersionId,
  context
}) => {
  const {
    computeMatchesForRerunReport,
    MATCH_TYPE
  } = require('../services/VerdictService/computeMatchesForRerunReport');
  const { testResult } = await findOrCreateTestResult({
    testId,
    testPlanRunId: testPlanRun.id,
    atVersionId,
    browserVersionId,
    context
  });

  const historicalTestResults = await getApprovedFinalizedTestResults(
    testPlanRun,
    context
  );

  const historicalTestResult = historicalTestResults?.find(each => {
    return each.testId === testId;
  });

  if (testResult.scenarioResults && historicalTestResult?.scenarioResults) {
    if (
      historicalTestResult &&
      historicalTestResult.scenarioResults?.length !==
        testResult.scenarioResults.length
    ) {
      throw new Error(
        'Historical test result does not match current test result'
      );
    }
  }

  const getAutomatedResultFromOutput = async ({ baseTestResult, outputs }) => {
    const currentOutputsByScenarioId = {};
    baseTestResult.scenarioResults.forEach((sr, i) => {
      currentOutputsByScenarioId[String(sr.scenarioId)] = outputs[i];
    });
    const matches = await computeMatchesForRerunReport({
      rerunTestPlanReportId: testPlanRun.testPlanReportId,
      context,
      currentOutputsByScenarioId
    });
    const resultWithVerdictsCopied = {
      ...baseTestResult,
      atVersionId,
      browserVersionId,
      scenarioResults: baseTestResult.scenarioResults.map(
        (scenarioResult, i) => {
          const m = matches
            ? matches.get(String(scenarioResult.scenarioId))
            : null;
          const isSameOrCross =
            m &&
            (m.type === MATCH_TYPE.SAME_SCENARIO ||
              m.type === MATCH_TYPE.CROSS_SCENARIO);

          return {
            ...scenarioResult,
            output: outputs[i],
            assertionResults: scenarioResult.assertionResults.map(
              assertionResult => ({
                ...assertionResult,
                ...(() => {
                  if (!isSameOrCross) {
                    return {
                      passed: null,
                      failedReason: 'AUTOMATED_OUTPUT_DIFFERS'
                    };
                  }
                  const copied =
                    m.source?.assertionResultsById?.[
                      String(assertionResult.assertionId)
                    ];
                  if (copied) {
                    return {
                      passed: copied.passed,
                      failedReason:
                        copied.failedReason === undefined
                          ? null
                          : copied.failedReason
                    };
                  }
                  return {
                    passed: null,
                    failedReason: 'AUTOMATED_OUTPUT_DIFFERS'
                  };
                })()
              })
            ),
            negativeSideEffects: isSameOrCross
              ? m.source?.negativeSideEffects ?? null
              : null,
            hasNegativeSideEffect: isSameOrCross
              ? m.source?.hasNegativeSideEffect ?? null
              : null,
            match: m
          };
        }
      )
    };

    // Check if all outputs matched historical outputs (verdicts were copied)
    const allOutputsMatched =
      matches !== null &&
      resultWithVerdictsCopied.scenarioResults.every(
        sr =>
          sr.match &&
          sr.match.type !== MATCH_TYPE.NONE &&
          sr.match.type !== MATCH_TYPE.INCOMPLETE
      );

    return {
      result: resultWithVerdictsCopied,
      shouldSubmit: allOutputsMatched
    };
  };

  const { result, shouldSubmit } = await getAutomatedResultFromOutput({
    baseTestResult: testResult,
    outputs: responses
  });

  return saveTestResultCommon({
    testResultId: testResult.id,
    input: convertTestResultToInput(result),
    isSubmit: shouldSubmit,
    context
  });
};

const updateJobResults = async (req, res) => {
  try {
    const { jobID: id, testRowNumber } = req.params;
    const context = getGraphQLContext({ req });
    const { transaction } = context;
    const {
      responses,
      status,
      capabilities: {
        atName,
        atVersion: atVersionName,
        browserName,
        browserVersion: browserVersionName
      } = {}
    } = req.body;

    const job =
      req.collectionJob ?? (await getCollectionJobById({ id, transaction }));
    if (!job) {
      throwNoJobFoundError(id);
    }

    if (job.status !== COLLECTION_JOB_STATUS.RUNNING) {
      throw new Error(
        `Job with id ${id} is not running, cannot update results`
      );
    }
    if (status && !Object.values(COLLECTION_JOB_STATUS).includes(status)) {
      throw new HttpQueryError(400, `Invalid status: ${status}`, true);
    }
    const { testPlanRun } = job;

    const testId = (
      await getTestByRowNumber({
        testPlanRun,
        testRowNumber,
        context
      })
    )?.id;

    if (testId === undefined) {
      throwNoTestFoundError(testRowNumber);
    }

    // status only update, or responses were provided (default to complete)
    if (status || responses) {
      await updateCollectionJobTestStatusByQuery({
        where: { collectionJobId: id, testId },
        // default to completed if not specified (when results are present)
        values: { status: status ?? COLLECTION_JOB_STATUS.COMPLETED },
        transaction: req.transaction
      });
    }

    // responses were provided
    if (responses) {
      /* TODO: Change this to use a better key based lookup system after gh-958 */
      const [at] = await getAts({ search: atName, transaction });
      if (!at) {
        throw new Error(`AT not found with name: ${atName}`);
      }

      const [browser] = await getBrowsers({
        search: browserName,
        transaction
      });
      if (!browser) {
        throw new Error(`Browser not found with name: ${browserName}`);
      }

      let parsedAtVersion = atVersionName;
      if (atName == 'JAWS') {
        // remove the reported 4th number in the version string.
        parsedAtVersion = atVersionName.split('.').slice(0, 3).join('.');
      }

      const [atVersion, browserVersion] = await Promise.all([
        findOrCreateAtVersion({
          where: { atId: at.id, name: parsedAtVersion },
          transaction
        }),
        findOrCreateBrowserVersion({
          where: { browserId: browser.id, name: browserVersionName },
          transaction
        })
      ]);

      const isVoiceOver = at.id === 3;
      if (isVoiceOver) {
        await promoteAutomationSupportedVersion({
          atVersionId: atVersion.id,
          transaction
        });
      }

      const processedResponses =
        convertEmptyStringsToNoOutputMessages(responses);

      await updateOrCreateTestResultWithResponses({
        testId,
        responses: processedResponses,
        testPlanRun,
        atVersionId: atVersion.id,
        browserVersionId: browserVersion.id,
        context
      });

      await updatePercentComplete({
        testPlanReportId: testPlanRun.testPlanReportId,
        transaction
      });

      await finalizeTestPlanReportIfAllTestsMatchHistoricalResults({
        id,
        transaction,
        context
      });
    }

    res.json({ success: true });
  } catch (error) {
    throw new HttpQueryError(
      error.statusCode || 500,
      `Error updating job results: ${error.message}`,
      true
    );
  }
};

const finalizeTestPlanReportIfAllTestsMatchHistoricalResults = async ({
  id,
  transaction,
  context
}) => {
  try {
    const updatedJob = await getCollectionJobById({ id, transaction });
    const { testPlanRun } = updatedJob;
    const { testPlanReport } = testPlanRun;

    // Return early if it's not a rerun report
    if (!testPlanRun.isRerun) return;

    const testPlanVersion = await getTestPlanVersionById({
      id: testPlanReport.testPlanVersionId,
      transaction
    });

    // Early return if there's no report or it's already finalized
    if (!testPlanReport || testPlanReport.markedFinalAt) return;

    const applicableTests = testPlanVersion.tests.filter(test => {
      return test.atIds.includes(testPlanReport.at.id);
    });
    const totalTests = applicableTests.length;

    // Return early if not all tests have been updated
    if (testPlanRun.testResults.length !== totalTests) return;

    const {
      computeMatchesForRerunReport,
      MATCH_TYPE
    } = require('../services/VerdictService/computeMatchesForRerunReport');
    const currentOutputsByScenarioId = {};
    for (const tr of testPlanRun.testResults) {
      for (const sr of tr.scenarioResults || []) {
        currentOutputsByScenarioId[String(sr.scenarioId)] = sr.output;
      }
    }
    const matches = await computeMatchesForRerunReport({
      rerunTestPlanReportId: testPlanReport.id,
      context,
      currentOutputsByScenarioId
    });

    let differentResponsesCount = 0;
    let allOutputsMatch = true;
    if (matches === null) {
      // No finalized candidates exist, skip comparison and completion event logic
      return;
    }

    for (const tr of testPlanRun.testResults) {
      for (const sr of tr.scenarioResults || []) {
        const m = matches.get(String(sr.scenarioId));
        if (
          !m ||
          m.type === MATCH_TYPE.NONE ||
          m.type === MATCH_TYPE.INCOMPLETE
        ) {
          differentResponsesCount++;
          allOutputsMatch = false;
        }
      }
    }

    if (allOutputsMatch) {
      // All tests match historical results; mark the report as final
      const updatedReport = await updateTestPlanReportById({
        id: testPlanReport.id,
        values: { markedFinalAt: new Date() },
        transaction
      });

      await createEvent({
        values: {
          description: `Test plan report for ${updatedReport.testPlanVersion.title} ${updatedReport.testPlanVersion.versionString} with ${updatedReport.at.name} ${updatedReport.exactAtVersion.name} and ${updatedReport.browser.name} had identical outputs to the previous finalized report, verdicts were copied, and the report was finalized`,
          type: EVENT_TYPES.COLLECTION_JOB_TEST_PLAN_REPORT
        },
        transaction
      });
    } else {
      const updatedReport = await getTestPlanReportById({
        id: testPlanReport.id,
        transaction
      });
      // Not all outputs match, but job is complete - create completion event
      await createEvent({
        values: {
          description: `Automated update for ${
            updatedReport.testPlanVersion.title
          } ${updatedReport.testPlanVersion.versionString} with ${
            updatedReport.at.name
          } ${updatedReport.exactAtVersion.name} and ${
            updatedReport.browser.name
          } is 100% complete with ${differentResponsesCount} different response${
            differentResponsesCount === 1 ? '' : 's'
          }`,
          type: EVENT_TYPES.COLLECTION_JOB_TEST_PLAN_REPORT
        },
        transaction
      });
    }
  } catch (error) {
    throw new HttpQueryError(
      error.statusCode || 500,
      `Error finalizing test plan report: ${error.message}`,
      true
    );
  }
};

// Human test runners are able to use a checkbox to indicate no output was detected.
// This checkbox stores 'No output was detected.' as the output value for that scenarioResult.
const convertEmptyStringsToNoOutputMessages = outputs =>
  outputs.map(output =>
    output === null || output.trim() === '' ? NO_OUTPUT_STRING : output
  );

module.exports = {
  cancelJob,
  updateJobStatus,
  updateJobResults,
  axiosConfig
};
