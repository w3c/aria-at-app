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
    BrowserVersion
} = require('../');
const { COLLECTION_JOB_ATTRIBUTES } = require('./helpers');
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
const { COLLECTION_JOB_STATUS } = require('../../util/enums');

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
    { id, status = 'QUEUED', testPlanRun, testPlanReportId },
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
 * Schedule a collection job with Response Scheduler
 * @param {object} input object for request to schedule job
 * @param {string} input.testPlanReportId id of test plan report to use for scheduling
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const scheduleCollectionJob = async ({ testPlanReportId }, options) => {
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

    const automationSchedulerResponse = await axios.post(
        `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/new`,
        {
            testPlanVersionGitSha: gitSha,
            testIds: tests.map(t => t.id),
            testPlanName: directory
        },
        axiosConfig
    );

    const { id, status } = automationSchedulerResponse.data;
    return createCollectionJob(
        {
            id,
            status,
            testPlanReportId
        },
        COLLECTION_JOB_ATTRIBUTES,
        options
    );
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
    const automationSchedulerResponse = await axios.post(
        `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${id}/cancel`,
        {},
        axiosConfig
    );

    if (
        automationSchedulerResponse.data.status ===
        COLLECTION_JOB_STATUS.CANCELLED
    ) {
        return updateCollectionJob(
            id,
            {
                status: COLLECTION_JOB_STATUS.CANCELLED
            },
            COLLECTION_JOB_ATTRIBUTES,
            options
        );
    } else {
        throw new HttpQueryError(
            502,
            `Error cancelling job: ${automationSchedulerResponse}`,
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
    await removeTestPlanRun(collectionJob.testPlanRun.id);
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
    const automationSchedulerResponse = await axios.post(
        `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/${id}/restart`,
        {},
        axiosConfig
    );

    if (
        automationSchedulerResponse?.data?.status ===
        COLLECTION_JOB_STATUS.QUEUED
    ) {
        return updateCollectionJob(
            id,
            {
                status: COLLECTION_JOB_STATUS.QUEUED
            },
            COLLECTION_JOB_ATTRIBUTES,
            options
        );
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
    cancelCollectionJob
};
