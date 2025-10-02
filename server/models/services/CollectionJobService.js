const ModelService = require('./ModelService');
const {
  CollectionJob,
  CollectionJobTestStatus,
  TestPlanReport
} = require('../');
const {
  COLLECTION_JOB_ATTRIBUTES,
  TEST_PLAN_ATTRIBUTES,
  TEST_PLAN_REPORT_ATTRIBUTES,
  TEST_PLAN_RUN_ATTRIBUTES,
  TEST_PLAN_VERSION_ATTRIBUTES,
  AT_ATTRIBUTES,
  BROWSER_ATTRIBUTES,
  USER_ATTRIBUTES,
  COLLECTION_JOB_TEST_STATUS_ATTRIBUTES
} = require('./helpers');
const {
  COLLECTION_JOB_STATUS,
  UPDATE_EVENT_TYPE
} = require('../../util/enums');
const { Op } = require('sequelize');
const {
  createTestPlanRun,
  removeTestPlanRunById
} = require('./TestPlanRunService');
const {
  getTestPlanReportById,
  cloneTestPlanReportWithNewAtVersion
} = require('./TestPlanReportService');
const { HttpQueryError } = require('apollo-server-core');

const {
  default: createGithubWorkflow,
  isEnabled: isGithubWorkflowEnabled
} = require('../../services/GithubWorkflowService');

const {
  startCollectionJobSimulation
} = require('../../tests/util/mock-automation-scheduler-server');

const runnableTestsResolver = require('../../resolvers/TestPlanReport/runnableTestsResolver');
const getGraphQLContext = require('../../graphql-context');
const { getBotUserByAtId } = require('./UserService');
const {
  getAtVersionWithRequirements,
  getLatestAutomationSupportedAtVersion,
  getRerunnableTestPlanReportsForVersion
} = require('./AtVersionService');
const { createUpdateEvent } = require('./UpdateEventService');

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanRunAssociation = (
  testPlanRunAttributes,
  userAttributes,
  testPlanReportAttributes,
  testPlanVersionAttributes,
  testPlanAttributes,
  atAttributes,
  browserAttributes
) => ({
  association: 'testPlanRun',
  attributes: testPlanRunAttributes,
  include: [
    // eslint-disable-next-line no-use-before-define
    userAssociation(userAttributes),
    testPlanReportAssociation(
      testPlanReportAttributes,
      testPlanRunAttributes,
      testPlanVersionAttributes,
      testPlanAttributes,
      atAttributes,
      browserAttributes,
      userAttributes
    )
  ]
});

/**
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} atAttributes - AT attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanReportAssociation = (
  testPlanReportAttributes,
  testPlanRunAttributes,
  testPlanVersionAttributes,
  testPlanAttributes,
  atAttributes,
  browserAttributes,
  userAttributes
) => ({
  association: 'testPlanReport',
  attributes: testPlanReportAttributes,
  include: [
    // eslint-disable-next-line no-use-before-define
    nestedTestPlanRunAssociation(testPlanRunAttributes, userAttributes),
    // eslint-disable-next-line no-use-before-define
    testPlanVersionAssociation(testPlanVersionAttributes, testPlanAttributes),
    // eslint-disable-next-line no-use-before-define
    atAssociation(atAttributes),
    // eslint-disable-next-line no-use-before-define
    browserAssociation(browserAttributes)
  ]
});

/**
 * Make sure nested TestPlanRuns do not include TestPlanReports which would produce an infinite loop
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const nestedTestPlanRunAssociation = (
  testPlanRunAttributes,
  userAttributes
) => ({
  association: 'testPlanRuns',
  attributes: testPlanRunAttributes,
  include: [
    // eslint-disable-next-line no-use-before-define
    userAssociation(userAttributes)
  ]
});

/**
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanVersionAssociation = (
  testPlanVersionAttributes,
  testPlanAttributes
) => ({
  association: 'testPlanVersion',
  attributes: testPlanVersionAttributes,
  include: [testPlanAssociation(testPlanAttributes)]
});

/**
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanAssociation = testPlanAttributes => ({
  association: 'testPlan',
  attributes: testPlanAttributes
});

/**
 * @param browserAttributes - Browser attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const browserAssociation = browserAttributes => ({
  association: 'browser',
  attributes: browserAttributes
});

/**
 * @param atAttributes - At attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = atAttributes => ({
  association: 'at',
  attributes: atAttributes
});

/**
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const userAssociation = userAttributes => ({
  association: 'tester',
  attributes: userAttributes
});

/**
 * @param {string[]} collectionJobTestStatusAttributes - attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const collectionJobTestStatusAssociation =
  collectionJobTestStatusAttributes => ({
    association: 'testStatus',
    attributes: collectionJobTestStatusAttributes
  });

/**
 * @param {object} options
 * @param {object} options.values
 * @param {string} options.values.status - Status of CollectionJob to be created
 * @param {number} options.values.testerUserId - ID of the Tester to which the CollectionJob should be assigned
 * @param {object} options.values.testPlanReportId - ID of the TestPlan with which the CollectionJob should be associated
 * @param {object} [options.values.testPlanRun] - TestPlan with wich the CollectionJob should be associated (if not provided, a new TestPlan will be created)
 * @param {boolean} [options.values.isRerun] - Whether the associated TestPlanRun is a rerun
 * @param {string[]} options.collectionJobAttributes - CollectionJob attributes to be returned in the result
 * @param {string[]} options.collectionJobTestStatusAttributes - CollectionJobTestStatus attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createCollectionJob = async ({
  values: {
    status = COLLECTION_JOB_STATUS.QUEUED,
    testerUserId,
    testPlanRun,
    testPlanReportId,
    isRerun = false
  },
  collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
  collectionJobTestStatusAttributes = COLLECTION_JOB_TEST_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  testPlanAttributes = TEST_PLAN_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  browserAttributes = BROWSER_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  if (!testPlanRun) {
    testPlanRun = await createTestPlanRun({
      values: {
        testerUserId,
        testPlanReportId: testPlanReportId,
        isAutomated: true,
        isRerun
      },
      transaction
    });
  }

  const { id: testPlanRunId } = testPlanRun.get({ plain: true });

  const collectionJobResult = await ModelService.create(CollectionJob, {
    values: { status, testPlanRunId },
    transaction
  });

  // create QUEUED status entries for each test in the test plan run
  const context = getGraphQLContext({ req: { transaction } });
  const tests = await runnableTestsResolver(
    testPlanRun.testPlanReport,
    null,
    context
  );
  await ModelService.bulkCreate(CollectionJobTestStatus, {
    valuesList: tests.map(test => ({
      testId: test.id,
      collectionJobId: collectionJobResult.id,
      status: COLLECTION_JOB_STATUS.QUEUED
    })),
    transaction
  });
  return ModelService.getById(CollectionJob, {
    id: collectionJobResult.id,
    attributes: collectionJobAttributes,
    include: [
      collectionJobTestStatusAssociation(collectionJobTestStatusAttributes),
      testPlanRunAssociation(
        testPlanRunAttributes,
        userAttributes,
        testPlanReportAttributes,
        testPlanVersionAttributes,
        testPlanAttributes,
        atAttributes,
        browserAttributes
      )
    ],
    transaction
  });
};

/**
 * @param {object} options
 * @param {string} options.id - id for the CollectionJob
 * @param {string[]} options.collectionJobAttributes - CollectionJob attributes to be returned in the result
 * @param {string[]} options.collectionJobTestStatusAttributes - CollectionJobTestStatus attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getCollectionJobById = async ({
  id,
  collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
  collectionJobTestStatusAttributes = COLLECTION_JOB_TEST_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  testPlanAttributes = TEST_PLAN_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  browserAttributes = BROWSER_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getById(CollectionJob, {
    id,
    attributes: collectionJobAttributes,
    include: [
      collectionJobTestStatusAssociation(collectionJobTestStatusAttributes),
      testPlanRunAssociation(
        testPlanRunAttributes,
        userAttributes,
        testPlanReportAttributes,
        testPlanVersionAttributes,
        testPlanAttributes,
        atAttributes,
        browserAttributes
      )
    ],
    transaction
  });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.collectionJobAttributes  - CollectionJob attributes to be returned in the result
 * @param {string[]} options.collectionJobTestStatusAttributes  - CollectionJobTestStatus attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getCollectionJobs = async ({
  search,
  where = {},
  collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
  collectionJobTestStatusAttributes = COLLECTION_JOB_TEST_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  testPlanAttributes = TEST_PLAN_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  browserAttributes = BROWSER_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  // search and filtering options
  const searchQuery = search ? `%${search}%` : '';
  if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

  return ModelService.get(CollectionJob, {
    where,
    attributes: collectionJobAttributes,
    include: [
      collectionJobTestStatusAssociation(collectionJobTestStatusAttributes),
      testPlanRunAssociation(
        testPlanRunAttributes,
        userAttributes,
        testPlanReportAttributes,
        testPlanVersionAttributes,
        testPlanAttributes,
        atAttributes,
        browserAttributes
      )
    ],
    pagination,
    transaction
    // logging: console.log
  });
};

/**
 * Trigger a workflow, set job status to ERROR if workflow creation fails.
 * @param {object} job - CollectionJob to trigger workflow for.
 * @param {number[]} testIds - Array of testIds
 * @param {object} atVersion - AtVersion to use for the workflow
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns Promise<CollectionJob>
 */
const triggerWorkflow = async (job, testIds, atVersion, { transaction }) => {
  const { testPlanVersion } = job.testPlanRun.testPlanReport;
  const { gitSha, directory } = testPlanVersion;
  try {
    if (isGithubWorkflowEnabled()) {
      // TODO: pass the reduced list of testIds along / deal with them somehow
      await createGithubWorkflow({ job, directory, gitSha, atVersion });
    } else {
      await startCollectionJobSimulation(job, testIds, atVersion, transaction);
    }
  } catch (error) {
    console.error(error);
    // TODO: What to do with the actual error (could be nice to have an additional "string" status field?)
    await updateCollectionJobTestStatusByQuery({
      where: { collectionJobId: job.id },
      values: { status: COLLECTION_JOB_STATUS.ERROR },
      transaction
    });
    return updateCollectionJobById({
      id: job.id,
      values: { status: COLLECTION_JOB_STATUS.ERROR },
      transaction
    });
  }
  return job;
};

/**
 * @param {object} options
 * @param {string} options.id - id of the CollectionJob to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.collectionJobAttributes  - CollectionJob attributes to be returned in the result
 * @param {string[]} options.collectionJobTestStatusAttributes  - CollectionJobTestStatus attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateCollectionJobById = async ({
  id,
  values = {},
  collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
  collectionJobTestStatusAttributes = COLLECTION_JOB_TEST_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  testPlanAttributes = TEST_PLAN_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  browserAttributes = BROWSER_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(CollectionJob, {
    where: { id },
    values,
    transaction
  });

  return ModelService.getById(CollectionJob, {
    id,
    attributes: collectionJobAttributes,
    include: [
      collectionJobTestStatusAssociation(collectionJobTestStatusAttributes),
      testPlanRunAssociation(
        testPlanRunAttributes,
        userAttributes,
        testPlanReportAttributes,
        testPlanVersionAttributes,
        testPlanAttributes,
        atAttributes,
        browserAttributes
      )
    ],
    transaction
  });
};

/**
 * Retry cancelled tests from a collection job
 * @param {object} input Input object for request to retry cancelled tests
 * @param {object} input.collectionJob CollectionJob to retry cancelled tests from
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const retryCanceledCollections = async ({ collectionJob }, { transaction }) => {
  if (!collectionJob) {
    throw new Error('collectionJob is required to retry cancelled tests');
  }

  const cancelledTests = collectionJob.testStatus.filter(
    testStatus => testStatus.status === COLLECTION_JOB_STATUS.CANCELLED
  );

  const testPlanReport = await getTestPlanReportById({
    id: collectionJob.testPlanRun.testPlanReportId,
    transaction
  });

  const atVersion = await getLatestAutomationSupportedAtVersion(
    testPlanReport.at.id,
    transaction
  );

  const testIds = cancelledTests.map(test => test.testId);

  const job = await updateCollectionJobById({
    id: collectionJob.id,
    values: { status: COLLECTION_JOB_STATUS.QUEUED },
    transaction
  });

  await updateCollectionJobTestStatusByQuery({
    where: {
      collectionJobId: job.id,
      status: COLLECTION_JOB_STATUS.CANCELLED
    },
    values: {
      status: COLLECTION_JOB_STATUS.QUEUED
    },
    transaction
  });

  return triggerWorkflow(job, testIds, atVersion, { transaction });
};

/**
 * Schedule a collection job with Response Scheduler
 * @param {object} input object for request to schedule job
 * @param {string} input.testPlanReportId id of test plan report to use for scheduling
 * @param {Array<string>} [input.testIds] optional: ids of tests to run
 * @param {object} [input.atVersion] optional: AT version to use for the job
 * @param {boolean} [input.isRerun] optional: mark associated TestPlanRun as rerun
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const scheduleCollectionJob = async (
  { testPlanReportId, testIds = null, atVersion, isRerun = false },
  { transaction }
) => {
  const context = getGraphQLContext({ req: { transaction } });

  const report = await getTestPlanReportById({
    id: testPlanReportId,
    transaction
  });

  if (!report) {
    throw new HttpQueryError(
      404,
      `Test plan report with id ${testPlanReportId} not found`,
      true
    );
  }

  if (!atVersion) {
    atVersion = await getLatestAutomationSupportedAtVersion(
      report.at.id,
      transaction
    );
  }

  const tests = await runnableTestsResolver(report, null, context);
  const { directory } = report.testPlanVersion.testPlan;
  const { gitSha } = report.testPlanVersion;
  const testerUser = await getBotUserByAtId({
    atId: report.at.id,
    transaction
  });
  if (!testerUser) {
    throw new Error(`No bot user found for AT ${report.at.name}`);
  }
  const testerUserId = testerUser.id;

  if (!tests || tests.length === 0) {
    throw new Error(
      `No runnable tests found for test plan report with id ${testPlanReportId}`
    );
  }

  if (!gitSha) {
    throw new Error(
      `Test plan version with id ${report.testPlanVersionId} does not have a gitSha`
    );
  }

  if (!directory) {
    throw new Error(
      `Test plan with id ${report.testPlanVersion.testPlanId} does not have a directory`
    );
  }

  const job = await createCollectionJob({
    values: {
      status: COLLECTION_JOB_STATUS.QUEUED,
      testerUserId,
      testPlanReportId,
      isRerun
    },
    transaction
  });

  return triggerWorkflow(
    job,
    testIds ?? tests.map(test => test.id),
    atVersion,
    {
      transaction
    }
  );
};

/**
 * Cancels a collection job by id through the Response Scheduler
 * @param {object} input Input object for request to cancel job
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[*, [*]]>}
 */
const cancelCollectionJob = async ({ id }, { transaction }) => {
  return updateCollectionJobById({
    id,
    values: {
      status: 'CANCELLED'
    },
    transaction
  });
};

/**
 * @param {object} options
 * @param {string} options.id - id of the CollectionJob to be deleted
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const removeCollectionJobById = async ({
  id,
  truncate = false,
  transaction
}) => {
  // Remove test plan run, may want to allow test plan run to
  // continue existing independent of collection job
  const collectionJob = await getCollectionJobById({ id, transaction });
  const result = await ModelService.removeById(CollectionJob, {
    id,
    truncate,
    transaction
  });
  await removeTestPlanRunById({
    id: collectionJob.testPlanRun?.id,
    truncate,
    transaction
  });
  return result;
};

/**
 * Restarts a collection job by id
 * @param {Object} input Input object for request to restart job
 * @param {string} input.collectionJobId id of collection job to restart
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns
 */
const restartCollectionJob = async ({ id }, { transaction }) => {
  const job = await updateCollectionJobById({
    id,
    values: {
      status: 'QUEUED'
    },
    transaction
  });
  await updateCollectionJobTestStatusByQuery({
    where: {
      collectionJobId: id
    },
    values: {
      status: COLLECTION_JOB_STATUS.QUEUED
    },
    transaction
  });

  if (!job) {
    return null;
  }

  const testPlanReport = await getTestPlanReportById({
    id: job.testPlanRun.testPlanReportId,
    transaction
  });

  const atVersion = await getLatestAutomationSupportedAtVersion(
    testPlanReport.at.id,
    transaction
  );

  const tests = await runnableTestsResolver(testPlanReport, null, {
    transaction
  });

  return triggerWorkflow(
    job,
    tests.map(test => test.id),
    atVersion,
    { transaction }
  );
};

/**
 * CollectionJobTestStatus updates
 */

/**
 * Update CollectionJobTestStatus entries in bulk via query.
 * @param {object} options
 * @param {object} options.where - values of the CollectionJobTestStatus record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateCollectionJobTestStatusByQuery = ({
  where,
  values = {},
  transaction
}) => {
  return ModelService.update(CollectionJobTestStatus, {
    values,
    where,
    transaction
  });
};

/**
 * Creates collection jobs for all test plan reports eligible for automation refresh.
 * A test plan report is eligible when:
 * - The Test Plan Version is in Candidate or Recommended
 * - The Test Plan Report has been marked final
 * - The Test Plan Report is the most recently "finalized" Report for the Test Plan Version
 * - The most recent AT version used in any Test Plan Run is older than the specified AT Version
 *
 * @param {object} options
 * @param {number} options.atVersionId - ID of the current AT version
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<Array>} - Array of created collection jobs
 */
const createCollectionJobsFromPreviousAtVersion = async ({
  atVersionId,
  transaction
}) => {
  const { currentVersion, previousVersionGroups } =
    await getRerunnableTestPlanReportsForVersion({
      currentAtVersionId: atVersionId,
      transaction
    });

  if (!currentVersion || !previousVersionGroups) {
    throw new Error('Failed to get rerunnable test plan reports');
  }

  if (previousVersionGroups.length === 0) {
    return {
      success: false,
      description: `No rerunnable reports found for AT version ${currentVersion.name}`,
      message: `No rerunnable reports found for AT version ${currentVersion.name}`
    };
  }

  const collectionJobs = [];

  for (const { reports } of previousVersionGroups) {
    await Promise.all(
      reports.map(async reportInfo => {
        try {
          const report = await TestPlanReport.findOne({
            where: { id: reportInfo.id },
            include: [
              {
                association: 'testPlanVersion',
                include: [{ association: 'testPlan', required: true }],
                required: true
              },
              { association: 'at', required: true }
            ],
            transaction
          });

          if (!report) return;

          const newReport = await cloneTestPlanReportWithNewAtVersion(
            report,
            currentVersion,
            transaction
          );

          const atVersion = await getAtVersionWithRequirements(
            newReport.at.id,
            currentVersion,
            null,
            transaction
          );

          if (!atVersion) return;

          const job = await scheduleCollectionJob(
            { testPlanReportId: newReport.id, atVersion, isRerun: true },
            { transaction }
          );

          collectionJobs.push(job);
        } catch (error) {
          console.error(
            `Failed to create collection job for report ${reportInfo.id}:`,
            error.message
          );

          await createUpdateEvent({
            values: {
              description: `Failed to start automated re-run for ${reportInfo.testPlanVersion.title} ${reportInfo.testPlanVersion.versionString} using ${currentVersion.at.name} ${currentVersion.name}: ${error.message}`,
              type: UPDATE_EVENT_TYPE.COLLECTION_JOB
            },
            transaction
          });
        }
      })
    );
  }

  const message = `Created ${collectionJobs.length} re-run collection job${
    collectionJobs.length === 1 ? '' : 's'
  } for ${currentVersion.at.name} ${currentVersion.name}`;

  await createUpdateEvent({
    values: {
      description: message,
      type: UPDATE_EVENT_TYPE.COLLECTION_JOB
    },
    transaction
  });

  return {
    collectionJobs,
    message
  };
};

module.exports = {
  // Basic CRUD
  createCollectionJob,
  getCollectionJobById,
  getCollectionJobs,
  updateCollectionJobById,
  removeCollectionJobById,
  // Custom for Response Scheduler
  scheduleCollectionJob,
  restartCollectionJob,
  cancelCollectionJob,
  retryCanceledCollections,
  createCollectionJobsFromPreviousAtVersion,
  // Basic CRUD for CollectionJobTestStatus
  updateCollectionJobTestStatusByQuery
};
