const ModelService = require('./ModelService');
const {
    CollectionJob,
    User,
    TestPlanRun,
    TestPlanReport,
    TestPlanVersion,
    At,
    Browser,
    AtVersion,
    BrowserVersion,
    sequelize
} = require('../');
const { COLLECTION_JOB_ATTRIBUTES } = require('./helpers');
const { COLLECTION_JOB_STATUS } = require('../../util/enums');
const { Op } = require('sequelize');
const {
    createTestPlanRun,
    removeTestPlanRun
} = require('./TestPlanRunService');
const {
    createUser,
    getUserByUsername,
    addUserToRole
} = require('./UserService');
const responseCollectionUser = require('../../util/responseCollectionUser');
const { getTestPlanReportById } = require('./TestPlanReportService');
const { HttpQueryError } = require('apollo-server-core');
const { runnableTests } = require('../../resolvers/TestPlanReport');
const { default: axios } = require('axios');
const {
    default: createGithubWorkflow
} = require('../../services/GithubWorkflowService');

const includeBrowserVersion = {
    model: BrowserVersion,
    as: 'browserVersions'
};

const includeBrowser = {
    model: Browser,
    as: 'browser',
    include: [includeBrowserVersion]
};

const includeAtVersion = {
    model: AtVersion,
    as: 'atVersions'
};

const includeAt = {
    model: At,
    as: 'at',
    include: [includeAtVersion]
};

const includeTestPlanVersion = {
    model: TestPlanVersion,
    as: 'testPlanVersion'
};

const includeTestPlanReport = {
    model: TestPlanReport,
    as: 'testPlanReport',
    include: [includeTestPlanVersion, includeAt, includeBrowser]
};

const includeTester = {
    model: User,
    as: 'tester'
};

const includeTestPlanRun = {
    model: TestPlanRun,
    as: 'testPlanRun',
    include: [includeTester, includeTestPlanReport]
};

const axiosConfig = {
    headers: {
        'x-automation-secret': process.env.AUTOMATION_SCHEDULER_SECRET
    },
    timeout: 1000
};

const automationSchedulerMockEnabled = !(
    process.env.ENVRIONMENT == 'production' ||
    process.env.AUTOMATION_CALLBACK_FQDN
);

/**
 * @param {object} collectionJob - CollectionJob to be created
 * @param {string} collectionJob.id - id for the CollectionJob
 * @param {string} collectionJob.status - status for the CollectionJob
 * @param {TestPlanRun} collectionJob.testPlanRun - TestPlanRun for the CollectionJob
 * @param {string} collectionJob.testPlanReportId - testPlanReportId for the CollectionJob
 * @param {string[]} attributes - attributes to include in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createCollectionJob = async (
    {
        id,
        status = COLLECTION_JOB_STATUS.QUEUED,
        testPlanRun,
        testPlanReportId
    },
    attributes = COLLECTION_JOB_ATTRIBUTES,
    options
) => {
    if (!testPlanRun) {
        let user = await getUserByUsername(responseCollectionUser.username);
        if (!user) {
            const roles = [{ name: User.TESTER }];
            user = await createUser(
                responseCollectionUser,
                { roles },
                undefined,
                undefined,
                [],
                []
            );
        }

        const { id: botUserId, roles } = user.get({ plain: true });
        if (!roles.find(role => role.name === User.TESTER)) {
            await addUserToRole(botUserId, User.TESTER);
        }

        testPlanRun = await createTestPlanRun({
            testerUserId: botUserId,
            testPlanReportId: testPlanReportId,
            isAutomated: true
        });
    }

    const { id: testPlanRunId } = testPlanRun.get({ plain: true });
    await ModelService.create(
        CollectionJob,
        { id, status, testPlanRunId },
        options
    );

    return ModelService.getById(
        CollectionJob,
        id,
        attributes,
        [includeTestPlanRun],
        options
    );
};

/**
 * @param {string} id - id for the CollectionJob
 * @param {string[]} attributes - attributes to include in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getCollectionJobById = async (
    id,
    attributes = COLLECTION_JOB_ATTRIBUTES,
    options
) => {
    return ModelService.getById(
        CollectionJob,
        id,
        attributes,
        [includeTestPlanRun],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} collectionJobAttributes  - Browser attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getCollectionJobs = async (
    search,
    filter = {},
    collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return ModelService.get(
        CollectionJob,
        where,
        collectionJobAttributes,
        [includeTestPlanRun],
        pagination,
        options
    );
};

/**
 * Trigger a workflow, set job status to ERROR if workflow creation fails.
 * @param {object} job - CollectionJob to trigger workflow for.
 * @param {object} options - Generic Options for sequelize
 * @returns CollectionJob
 */
const triggerWorkflow = async (job, options) => {
    const { testPlanVersion } = job.testPlanRun.testPlanReport;
    const { gitSha, directory } = testPlanVersion;
    try {
        await createGithubWorkflow({ job, directory, gitSha });
    } catch (error) {
        // TODO: What to do with the actual error (could be nice to have an additional "string" status field?)
        return await updateCollectionJob(
            job.id,
            { status: COLLECTION_JOB_STATUS.ERROR },
            COLLECTION_JOB_ATTRIBUTES,
            options
        );
    }
    return job;
};

/**
 * @param {string} id - id of the CollectionJob to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} collectionJobAttributes - CollectionJob attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateCollectionJob = async (
    id,
    updateParams = {},
    collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
    options
) => {
    await ModelService.update(CollectionJob, { id }, updateParams, options);

    return ModelService.getById(
        CollectionJob,
        id,
        collectionJobAttributes,
        [includeTestPlanRun],
        options
    );
};

/**
 * Retry cancelled tests from a collection job
 * @param {object} input Input object for request to retry cancelled tests
 * @param {object} input.collectionJob CollectionJob to retry cancelled tests from
 * @param {string[]} collectionJobAttributes - CollectionJob attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const retryCancelledCollections = async (
    { collectionJob },
    collectionJobAttributes = COLLECTION_JOB_ATTRIBUTES,
    options
) => {
    if (!collectionJob) {
        throw new Error('collectionJob is required to retry cancelled tests');
    }

    const cancelledTests = collectionJob.testPlanRun.testResults.filter(
        testResult =>
            // Find tests that don't have complete output
            !testResult?.scenarioResults?.every(
                scenario => scenario?.output !== null
            )
    );

    const testIds = cancelledTests.map(test => test.id);
    const { testPlanVersion } = collectionJob.testPlanRun.testPlanReport;
    if (automationSchedulerMockEnabled) {
        const res = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/new`,
            {
                testPlanVersionGitSha: testPlanVersion.gitSha,
                testIds,
                testPlanName: testPlanVersion.directory,
                jobId: collectionJob.id
            },
            axiosConfig
        );
        if (res.status !== 200) {
            throw new Error(
                `Error from Github while retrying cancelled tests: ${res.data}`
            );
        }
    }

    const job = ModelService.getById(
        CollectionJob,
        collectionJob.id,
        collectionJobAttributes,
        [includeTestPlanRun],
        options
    );

    if (!automationSchedulerMockEnabled) {
        // TODO: pass the reduced list of testIds along / deal with them somehow
        return await triggerWorkflow(job, options);
    }
};

/**
 * Schedule a collection job with Response Scheduler
 * @param {object} input object for request to schedule job
 * @param {string} input.testPlanReportId id of test plan report to use for scheduling
 * @param {Array<string>} input.testIds optional: ids of tests to run
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const scheduleCollectionJob = async (
    { testPlanReportId, testIds = null },
    options
) => {
    const report = await getTestPlanReportById(testPlanReportId);

    if (!report) {
        throw new HttpQueryError(
            404,
            `Test plan report with id ${testPlanReportId} not found`,
            true
        );
    }

    const tests = await runnableTests(report);
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
        { model: CollectionJob, mapToModel: true }
    );
    let jobId;
    if (lastRecord.length > 0) {
        jobId = (Number(lastRecord[0].id) + 1).toString();
    } else {
        jobId = '1';
    }

    let status = 'QUEUED';

    if (automationSchedulerMockEnabled) {
        const automationSchedulerResponse = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/new`,
            {
                testPlanVersionGitSha: gitSha,
                testIds: testIds ?? tests.map(t => t.id),
                testPlanName: directory,
                jobId
            },
            axiosConfig
        );
        status = automationSchedulerResponse.data.status;
    }

    const job = await createCollectionJob(
        {
            id: jobId,
            status,
            testPlanReportId
        },
        COLLECTION_JOB_ATTRIBUTES,
        options
    );

    if (!automationSchedulerMockEnabled) {
        return await triggerWorkflow(job, options);
    }

    return job;
};

/**
 * Gets one CollectionJob and optionally updates it, or creates it if it doesn't exist.
 * @param {*} nestedGetOrCreateValues - These values will be used to find a matching record, or they will be used to create one
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[*, [*]]>}
 */
const getOrCreateCollectionJob = async (
    { id, status, testPlanRun, testPlanReportId },
    options
) => {
    const existingJob = await getCollectionJobById(id);

    if (existingJob) {
        return existingJob;
    } else {
        if (!testPlanReportId) {
            throw new Error(
                'testPlanReportId is required to create a new CollectionJob'
            );
        }

        return createCollectionJob(
            {
                id,
                status,
                testPlanRun,
                testPlanReportId
            },
            COLLECTION_JOB_ATTRIBUTES,
            options
        );
    }
};

/**
 * Cancels a collection job by id through the Response Scheduler
 * @param {object} input Input object for request to cancel job
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[*, [*]]>}
 */
const cancelCollectionJob = async ({ id }, options) => {
    // Not currently in use as the Response Scheduler does not support cancelling jobs
    let errorCanceling = false;
    if (automationSchedulerMockEnabled) {
        const automationSchedulerResponse = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${id}/cancel`,
            {},
            axiosConfig
        );
        errorCanceling =
            automationSchedulerResponse.data.status !== 'CANCELLED' &&
            JSON.stringify(automationSchedulerResponse);
    }

    if (!errorCanceling) {
        return updateCollectionJob(
            id,
            {
                status: 'CANCELLED'
            },
            COLLECTION_JOB_ATTRIBUTES,
            options
        );
    } else {
        throw new HttpQueryError(
            502,
            `Error cancelling job: ${errorCanceling}`,
            true
        );
    }
};

/**
 * @param {string} id - id of the CollectionJob to be deleted
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const deleteCollectionJob = async (id, options) => {
    // Remove test plan run, may want to allow test plan run to
    // continue existing independent of collection job
    const collectionJob = await getCollectionJobById(id);
    const res = await ModelService.removeById(CollectionJob, id, options);
    await removeTestPlanRun(collectionJob.testPlanRun?.id);
    return res;
};

/**
 * Restarts a collection job by id
 * @param {Object} input Input object for request to restart job
 * @param {string} input.collectionJobId id of collection job to restart
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns
 */
const restartCollectionJob = async ({ id }, options) => {
    let continueRestart = !automationSchedulerMockEnabled;
    if (automationSchedulerMockEnabled) {
        const automationSchedulerResponse = await axios.post(
            `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${id}/restart`,
            {},
            axiosConfig
        );
        continueRestart =
            automationSchedulerResponse?.data?.status === 'QUEUED';
    }

    if (continueRestart) {
        const job = updateCollectionJob(
            id,
            {
                status: 'QUEUED'
            },
            COLLECTION_JOB_ATTRIBUTES,
            options
        );
        if (!automationSchedulerMockEnabled) {
            return await triggerWorkflow(job, options);
        }
        return job;
    } else {
        throw new HttpQueryError(
            502,
            `Error restarting job with id ${id}`,
            true
        );
    }
};

module.exports = {
    // Basic CRUD
    createCollectionJob,
    getCollectionJobById,
    getCollectionJobs,
    updateCollectionJob,
    deleteCollectionJob,
    // Nested CRUD
    getOrCreateCollectionJob,
    // Custom for Response Scheduler
    scheduleCollectionJob,
    restartCollectionJob,
    cancelCollectionJob,
    retryCancelledCollections
};
