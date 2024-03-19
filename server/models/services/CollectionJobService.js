const ModelService = require('./ModelService');
const { CollectionJob, sequelize } = require('../');
const {
  COLLECTION_JOB_ATTRIBUTES,
  TEST_PLAN_ATTRIBUTES,
  TEST_PLAN_REPORT_ATTRIBUTES,
  TEST_PLAN_RUN_ATTRIBUTES,
  TEST_PLAN_VERSION_ATTRIBUTES,
  AT_ATTRIBUTES,
  BROWSER_ATTRIBUTES,
  USER_ATTRIBUTES
} = require('./helpers');
const { COLLECTION_JOB_STATUS } = require('../../util/enums');
const { Op } = require('sequelize');
const {
  createTestPlanRun,
  removeTestPlanRunById
} = require('./TestPlanRunService');
const responseCollectionUser = require('../../util/responseCollectionUser');
const { getTestPlanReportById } = require('./TestPlanReportService');
const { HttpQueryError } = require('apollo-server-core');
const { default: axios } = require('axios');
const {
  default: createGithubWorkflow,
  isEnabled: isGithubWorkflowEnabled
} = require('../../services/GithubWorkflowService');
const runnableTestsResolver = require('../../resolvers/TestPlanReport/runnableTestsResolver');

const axiosConfig = {
  headers: {
    'x-automation-secret': process.env.AUTOMATION_SCHEDULER_SECRET
  },
  timeout: 1000
};

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
 * @param {object} options
 * @param {object} options.values - CollectionJob to be created
 * @param {string[]} options.collectionJobAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createCollectionJob = async ({
  values: {
    id,
    status = COLLECTION_JOB_STATUS.QUEUED,
    testPlanRun,
    testPlanReportId
  },
  collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
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
        testerUserId: responseCollectionUser.id,
        testPlanReportId: testPlanReportId,
        isAutomated: true
      },
      transaction
    });
  }

  const { id: testPlanRunId } = testPlanRun.get({ plain: true });

  await ModelService.create(CollectionJob, {
    values: { id, status, testPlanRunId },
    transaction
  });

  return ModelService.getById(CollectionJob, {
    id,
    attributes: collectionJobAttributes,
    include: [
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
 * @param {string[]} options.collectionJobAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
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
 * @param {string[]} options.collectionJobAttributes  - Browser attributes to be returned in the result
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
  });
};

/**
 * Trigger a workflow, set job status to ERROR if workflow creation fails.
 * @param {object} job - CollectionJob to trigger workflow for.
 * @param {number[]} testIds - Array of testIds
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns Promise<CollectionJob>
 */
const triggerWorkflow = async (job, testIds, { transaction }) => {
  const { testPlanVersion } = job.testPlanRun.testPlanReport;
  const { gitSha, directory } = testPlanVersion;
  try {
    if (isGithubWorkflowEnabled()) {
      // TODO: pass the reduced list of testIds along / deal with them somehow
      await createGithubWorkflow({ job, directory, gitSha });
    } else {
      await axios.post(
        `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/new`,
        {
          testPlanVersionGitSha: gitSha,
          testIds,
          testPlanName: directory,
          jobId: job.id
        },
        axiosConfig
      );
    }
  } catch (error) {
    // TODO: What to do with the actual error (could be nice to have an additional "string" status field?)
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
 * @param {string[]} options.collectionJobAttributes  - Browser attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
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

  const cancelledTests = collectionJob.testPlanRun.testResults.filter(
    testResult =>
      // Find tests that don't have complete output
      !testResult?.scenarioResults?.every(scenario => scenario?.output !== null)
  );

  const testIds = cancelledTests.map(test => test.id);

  const job = await getCollectionJobById({
    id: collectionJob.id,
    transaction
  });

  return triggerWorkflow(job, testIds, { transaction });
};

/**
 * Schedule a collection job with Response Scheduler
 * @param {object} input object for request to schedule job
 * @param {string} input.testPlanReportId id of test plan report to use for scheduling
 * @param {Array<string>} input.testIds optional: ids of tests to run
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const scheduleCollectionJob = async (
  { testPlanReportId, testIds = null },
  { transaction }
) => {
  const context = { transaction };

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

  const tests = await runnableTestsResolver(report, null, context);
  const { directory } = report.testPlanVersion.testPlan;
  const { gitSha } = report.testPlanVersion;

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

  // TODO: Replace by allowing CollectionJob id to auto-increment
  const lastRecord = await sequelize.query(
    `SELECT * FROM "CollectionJob" ORDER BY CAST(id AS INTEGER) DESC LIMIT 1`,
    { model: CollectionJob, mapToModel: true, transaction }
  );
  let jobId;
  if (lastRecord.length > 0) {
    jobId = (Number(lastRecord[0].id) + 1).toString();
  } else {
    jobId = '1';
  }

  const job = await createCollectionJob({
    values: {
      id: jobId,
      status: COLLECTION_JOB_STATUS.QUEUED,
      testPlanReportId
    },
    transaction
  });

  return triggerWorkflow(job, testIds ?? tests.map(test => test.id), {
    transaction
  });
};

/**
 * Gets one CollectionJob and optionally updates it, or creates it if it doesn't exist.
 * @param {object} options
 * @param {*} options.where - These values will be used to find a matching record, or they will be used to create one
 * @param {*} options.values - Additional values to be used when creating but not while finding
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[*, [*]]>}
 */
const getOrCreateCollectionJob = async ({
  where: { id },
  values: { status, testPlanRun, testPlanReportId } = {},
  transaction
}) => {
  const existingJob = await getCollectionJobById({ id, transaction });

  if (existingJob) {
    return existingJob;
  } else {
    if (!testPlanReportId) {
      throw new Error(
        'testPlanReportId is required to create a new CollectionJob'
      );
    }

    return createCollectionJob({
      values: { id, status, testPlanRun, testPlanReportId },
      transaction
    });
  }
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

  if (!job) {
    return null;
  }

  return triggerWorkflow(job, [], { transaction });
};

module.exports = {
  // Basic CRUD
  createCollectionJob,
  getCollectionJobById,
  getCollectionJobs,
  updateCollectionJobById,
  removeCollectionJobById,
  // Nested CRUD
  getOrCreateCollectionJob,
  // Custom for Response Scheduler
  scheduleCollectionJob,
  restartCollectionJob,
  cancelCollectionJob,
  retryCanceledCollections
};
