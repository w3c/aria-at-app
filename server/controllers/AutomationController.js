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
  findOrCreateAtVersion,
  getHistoricalReportsForVerdictCopying
} = require('../models/services/AtVersionService');
const { getAts } = require('../models/services/AtService');
const {
  getBrowsers,
  findOrCreateBrowserVersion
} = require('../models/services/BrowserService');
const { HttpQueryError } = require('apollo-server-core');
const {
  COLLECTION_JOB_STATUS,
  isJobStatusFinal,
  UPDATE_EVENT_TYPE
} = require('../util/enums');
const {
  getFinalizedTestResults
} = require('../models/services/TestResultReadService');
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
const { createUpdateEvent } = require('../models/services/UpdateEventService');
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

const getApprovedFinalizedTestResults = async (testPlanRun, context) => {
  const { testPlanReport } = await populateData(
    { testPlanReportId: testPlanRun.testPlanReport.id },
    { context }
  );

  // If the current report is finalized
  // Use the finalized test results (from another run)
  if (testPlanReport.markedFinalAt !== null) {
    return getFinalizedTestResults({ testPlanReport, context });
  }

  // Otherwise, fallback to historical report from previous automatable AT version
  // Refresh collection jobs will have an exactAtVersion
  const currentAtVersionId = testPlanReport.exactAtVersion?.id;

  if (!currentAtVersionId) {
    return null;
  }

  const { previousVersionGroups } = await getHistoricalReportsForVerdictCopying(
    {
      currentAtVersionId,
      transaction: context.transaction
    }
  );

  if (!previousVersionGroups?.length) {
    return null;
  }

  // Fetch all candidate historical reports concurrently
  const historicalReports = await Promise.all(
    previousVersionGroups.flatMap(group =>
      group.reports.map(report =>
        getTestPlanReportById({
          id: report.id,
          transaction: context.transaction
        })
      )
    )
  );

  // Select the historical report matching the same test plan version and that is finalized
  const historicalReport = historicalReports.find(report => {
    const matches =
      report.testPlanVersion.id === testPlanReport.testPlanVersion.id &&
      report.markedFinalAt !== null;
    return matches;
  });

  if (!historicalReport) {
    return null;
  }

  const finalHistoricalReport = await populateData(
    { testPlanReportId: historicalReport.id },
    { context }
  );
  if (!finalHistoricalReport) {
    return null;
  }

  return getFinalizedTestResults({
    testPlanReport: finalHistoricalReport.testPlanReport,
    context
  });
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

  if (
    historicalTestResult &&
    historicalTestResult.scenarioResults?.length !==
      testResult.scenarioResults.length
  ) {
    throw new Error(
      'Historical test result does not match current test result'
    );
  }

  const getAutomatedResultFromOutput = ({ baseTestResult, outputs }) => ({
    ...baseTestResult,
    atVersionId,
    browserVersionId,
    scenarioResults: baseTestResult.scenarioResults.map((scenarioResult, i) => {
      // Check if output matches historical output
      const outputMatches =
        historicalTestResult &&
        historicalTestResult.scenarioResults[i] &&
        historicalTestResult.scenarioResults[i].output === outputs[i];

      return {
        ...scenarioResult,
        output: outputs[i],
        assertionResults: scenarioResult.assertionResults.map(
          (assertionResult, j) => ({
            ...assertionResult,
            passed: outputMatches
              ? historicalTestResult.scenarioResults[i].assertionResults[j]
                  .passed
              : false,
            failedReason: outputMatches
              ? historicalTestResult.scenarioResults[i].assertionResults[j]
                  .failedReason
              : 'AUTOMATED_OUTPUT'
          })
        ),
        unexpectedBehaviors: null
      };
    })
  });

  return saveTestResultCommon({
    testResultId: testResult.id,
    input: convertTestResultToInput(
      getAutomatedResultFromOutput({
        baseTestResult: testResult,
        outputs: responses
      })
    ),
    isSubmit: false,
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

      const [atVersion, browserVersion] = await Promise.all([
        findOrCreateAtVersion({
          where: { atId: at.id, name: atVersionName },
          transaction
        }),
        findOrCreateBrowserVersion({
          where: { browserId: browser.id, name: browserVersionName },
          transaction
        })
      ]);

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

    const historicalResults = await getApprovedFinalizedTestResults(
      testPlanRun,
      context
    );
    if (!historicalResults) return;

    // Validate each applicable test's results against historical results
    for (const test of applicableTests) {
      const currResult = testPlanRun.testResults.find(
        tr => String(tr.testId) === String(test.id)
      );
      const histResult = historicalResults.find(
        hr => String(hr.testId) === String(test.id)
      );
      if (!currResult || !histResult) return;
      if (
        !currResult.scenarioResults ||
        currResult.scenarioResults.length !== histResult.scenarioResults.length
      )
        return;
      for (let i = 0; i < currResult.scenarioResults.length; i++) {
        if (
          currResult.scenarioResults[i].output !==
          histResult.scenarioResults[i].output
        )
          return;
      }
    }

    // All tests match historical results; mark the report as final
    const updatedReport = await updateTestPlanReportById({
      id: testPlanReport.id,
      values: { markedFinalAt: new Date() },
      transaction
    });

    await createUpdateEvent({
      values: {
        description: `Test plan report for ${updatedReport.testPlanVersion.title} ${updatedReport.testPlanVersion.versionString} with ${updatedReport.at.name} ${updatedReport.exactAtVersion.name} and ${updatedReport.browser.name} had identical outputs to the previous finalized report, verdicts were copied, and the report was finalized`,
        type: UPDATE_EVENT_TYPE.TEST_PLAN_REPORT
      },
      transaction
    });
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
