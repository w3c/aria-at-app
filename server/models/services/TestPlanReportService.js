const { sequelize } = require('../');
const ModelService = require('./ModelService');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    AT_ATTRIBUTES,
    BROWSER_ATTRIBUTES,
    USER_ATTRIBUTES,
    TEST_PLAN_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport, TestPlanVersion } = require('../');

// custom column additions to Models being queried
const testPlanRunLiterals = [
    sequelize.literal(`(
        WITH testPlanRunResult AS ( SELECT jsonb_array_elements("testResults") AS results )
        SELECT COUNT(*)
        FROM testPlanRunResult
        WHERE (testPlanRunResult.results -> 'completedAt') IS NOT NULL
            AND (testPlanRunResult.results -> 'completedAt') != 'null'
    )`),
    'testResultsLength'
];

const testPlanVersionLiterals = [
    sequelize.literal(`(
        WITH testPlanVersionResult AS ( SELECT jsonb_array_elements("tests") AS results )
        SELECT json_build_array(
            ( SELECT COUNT(*)
                FROM testPlanVersionResult
                WHERE testPlanVersionResult.results @> '{"atIds": [1]}' ),
            ( SELECT COUNT (*)
                FROM testPlanVersionResult
                WHERE testPlanVersionResult.results @> '{"atIds": [2]}' ),
            ( SELECT COUNT(*)
                FROM testPlanVersionResult
                WHERE testPlanVersionResult.results @> '{"atIds": [3]}' )
        )
        FROM testPlanVersionResult
        LIMIT 1 )`),
    'runnableTestsCount'
];

// association helpers to be included with Models' results
/**
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanRunAssociation = (testPlanRunAttributes, userAttributes) => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes?.length
        ? testPlanRunAttributes.concat([testPlanRunLiterals])
        : testPlanRunAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        userAssociation(userAttributes)
    ]
});

/**
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanVersionAssociation = (
    testPlanVersionAttributes,
    testPlanAttributes
) => ({
    association: 'testPlanVersion',
    attributes: testPlanVersionAttributes?.length
        ? testPlanVersionAttributes.concat([testPlanVersionLiterals])
        : testPlanVersionAttributes,
    include: [testPlanAssociation(testPlanAttributes)]
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
 * @param {string[]} testPlanAttributes - TestPlanReport attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanAssociation = testPlanAttributes => ({
    association: 'testPlan',
    attributes: testPlanAttributes
});

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {number} options.id - unique id of the TestPlanReport model being queried
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes - At attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanReportById = async ({
    id,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    return ModelService.getById(TestPlanReport, {
        id,
        attributes: testPlanReportAttributes,
        include: [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanVersionAssociation(
                testPlanVersionAttributes,
                testPlanAttributes
            ),
            atAssociation(atAttributes),
            browserAssociation(browserAttributes)
        ],
        transaction
    });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - Use this to define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.atAttributes - At attributes to be returned in the result
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
const getTestPlanReports = async ({
    // search, // Nothing to search
    where = {},
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
    return ModelService.get(TestPlanReport, {
        where,
        attributes: testPlanReportAttributes,
        include: [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanVersionAssociation(
                testPlanVersionAttributes,
                testPlanAttributes
            ),
            atAssociation(atAttributes),
            browserAssociation(browserAttributes)
        ],
        pagination,
        transaction
    });
};

/**
 * @param {object} options
 * @param {object} values - values to be used to create the TestPlanReport
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlanReport = async ({
    values: {
        testPlanVersionId,
        atId,
        browserId,
        exactAtVersionId,
        minimumAtVersionId,
        vendorReviewStatus
    },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    const testPlanVersion = await TestPlanVersion.findOne({
        where: { id: testPlanVersionId },
        transaction
    });
    const testPlanReportResult = await ModelService.create(TestPlanReport, {
        values: {
            testPlanVersionId,
            atId,
            browserId,
            exactAtVersionId,
            minimumAtVersionId,
            vendorReviewStatus,
            testPlanId: testPlanVersion.testPlanId
        },
        transaction
    });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return ModelService.getById(TestPlanReport, {
        id: testPlanReportResult.id,
        attributes: testPlanReportAttributes,
        include: [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanVersionAssociation(
                testPlanVersionAttributes,
                testPlanAttributes
            ),
            atAssociation(atAttributes),
            browserAssociation(browserAttributes)
        ],
        transaction
    });
};

/**
 * @param {object} options
 * @param {number} options.id - unique id of the TestPlanReport model being to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes - At attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTestPlanReportById = async ({
    id,
    values: { metrics, testPlanVersionId, vendorReviewStatus, markedFinalAt },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    await ModelService.update(TestPlanReport, {
        where: { id },
        values: {
            metrics,
            testPlanVersionId,
            vendorReviewStatus,
            markedFinalAt
        },
        transaction
    });

    // call custom this.getById if custom attributes are being accounted for
    return getTestPlanReportById({
        id,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanAttributes,
        atAttributes,
        browserAttributes,
        userAttributes,
        transaction
    });
};

/**
 * @param {object} options
 * @param {string} options.id - id of the TestPlanReport record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeTestPlanReportById = async ({
    id,
    truncate = false,
    transaction
}) => {
    return ModelService.removeById(TestPlanReport, {
        id,
        truncate,
        transaction
    });
};

module.exports = {
    // Basic CRUD
    getTestPlanReportById,
    getTestPlanReports,
    createTestPlanReport,
    updateTestPlanReportById,
    removeTestPlanReportById
};
