const ModelService = require('./ModelService');
const {
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES,
    AT_ATTRIBUTES,
    BROWSER_ATTRIBUTES,
    TEST_PLAN_ATTRIBUTES
} = require('./helpers');
const { Sequelize, TestPlanVersion } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanAttributes - TestPlan attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanAssociation = testPlanAttributes => ({
    association: 'testPlan',
    attributes: testPlanAttributes
});

/**
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes
 * @param {string[]} atAttributes - AT attributes
 * @param {string[]} browserAttributes - Browser attributes
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanReportAssociation = (
    testPlanReportAttributes,
    atAttributes,
    browserAttributes,
    testPlanRunAttributes,
    userAttributes
) => ({
    association: 'testPlanReports',
    attributes: testPlanReportAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        atAssociation(atAttributes),
        // eslint-disable-next-line no-use-before-define
        browserAssociation(browserAttributes),
        // eslint-disable-next-line no-use-before-define
        testPlanRunAssociation(testPlanRunAttributes, userAttributes)
    ]
});

/**
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanRunAssociation = (testPlanRunAttributes, userAttributes) => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        userAssociation(userAttributes)
    ]
});

/**
 * @param {string[]} atAttributes - AT attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = atAttributes => ({
    association: 'at',
    attributes: atAttributes
});

/**
 * @param {string[]} browserAttributes - Browser attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserAssociation = browserAttributes => ({
    association: 'browser',
    attributes: browserAttributes
});

/**
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const userAssociation = userAttributes => ({
    association: 'tester',
    attributes: userAttributes
});

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {number} options.id - unique id of the TestPlanReport model being queried
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanVersionById = async ({
    id,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    return ModelService.getById(TestPlanVersion, {
        id,
        attributes: testPlanVersionAttributes,
        include: [
            testPlanReportAssociation(
                testPlanReportAttributes,
                atAttributes,
                browserAttributes,
                testPlanRunAttributes,
                userAttributes
            )
        ],
        transaction
    });
};

/**
 * @param {object} options
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this to define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanVersions = async ({
    search,
    where = {},
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {},
    transaction = {}
}) => {
    // search and filtering options
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, title: { [Op.iLike]: searchQuery } };

    return ModelService.get(TestPlanVersion, {
        where,
        attributes: testPlanVersionAttributes,
        include: [
            testPlanAssociation(testPlanAttributes),
            testPlanReportAssociation(
                testPlanReportAttributes,
                atAttributes,
                browserAttributes,
                testPlanRunAttributes,
                userAttributes
            )
        ],
        pagination,
        transaction
    });
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the TestPlanVersion
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlanVersion = async ({
    values: {
        // ID must be provided, so it matches the ID which is baked into the Test
        // IDs (see LocationOfDataId.js for more information).
        id,
        title,
        directory,
        phase,
        gitSha,
        gitMessage,
        testPageUrl,
        hashedTests,
        updatedAt,
        versionString,
        metadata,
        tests,
        testPlanId = null
    },
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    await ModelService.create(TestPlanVersion, {
        values: {
            id,
            title,
            directory,
            phase,
            gitSha,
            gitMessage,
            testPageUrl,
            hashedTests,
            updatedAt,
            versionString,
            metadata,
            tests,
            testPlanId
        },
        transaction
    });

    return getTestPlanVersionById({
        id,
        testPlanVersionAttributes,
        testPlanReportAttributes,
        atAttributes,
        browserAttributes,
        testPlanRunAttributes,
        userAttributes,
        transaction
    });
};

/**
 * @param {object} options
 * @param {number} id - id of the TestPlanVersion record to be updated
 * @param {object} values - values to be used to updated on the TestPlanVersion
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} atAttributes - AT attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTestPlanVersionById = async ({
    id,
    values: {
        title,
        directory,
        phase,
        gitSha,
        gitMessage,
        testPageUrl,
        hashedTests,
        updatedAt,
        versionString,
        metadata,
        tests,
        draftPhaseReachedAt,
        candidatePhaseReachedAt,
        recommendedPhaseReachedAt,
        recommendedPhaseTargetDate,
        deprecatedAt
    },
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    await ModelService.update(TestPlanVersion, {
        where: { id },
        values: {
            title,
            directory,
            phase,
            gitSha,
            gitMessage,
            testPageUrl,
            hashedTests,
            updatedAt,
            versionString,
            metadata,
            tests,
            draftPhaseReachedAt,
            candidatePhaseReachedAt,
            recommendedPhaseReachedAt,
            recommendedPhaseTargetDate,
            deprecatedAt
        },
        transaction
    });

    return getTestPlanVersionById({
        id,
        testPlanVersionAttributes,
        testPlanReportAttributes,
        atAttributes,
        browserAttributes,
        testPlanRunAttributes,
        userAttributes,
        transaction
    });
};

module.exports = {
    // Basic CRUD
    getTestPlanVersionById,
    getTestPlanVersions,
    createTestPlanVersion,
    updateTestPlanVersionById
};
