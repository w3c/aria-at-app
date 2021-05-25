const ModelService = require('./ModelService');
const {
    TEST_PLAN_RUN_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_RESULT_ATTRIBUTES,
    USER_ATTRIBUTES
} = require('./helpers');
const { TestPlanRun } = require('../');

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanReportAssociation = testPlanReportAttributes => ({
    association: 'testPlanReport',
    attributes: testPlanReportAttributes
});

/**
 * @param {string[]} testResultAttributes - TestResult attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testResultAssociation = testResultAttributes => ({
    association: 'testResults',
    attributes: testResultAttributes
});

/**
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const userAssociation = userAttributes => ({
    association: 'tester',
    attributes: userAttributes
});

// TestPlanRun

/**
 * @param {number} id - id of TestPlanRun to be retrieved
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getTestPlanRunById = async (
    id,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    return ModelService.getById(TestPlanRun, id, testPlanRunAttributes, [
        testPlanReportAssociation(testPlanReportAttributes),
        testResultAssociation(testResultAttributes),
        userAssociation(userAttributes)
    ]);
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getTestPlanRuns = async (
    search,
    filter = {},
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };

    return ModelService.get(
        TestPlanRun,
        where,
        testPlanRunAttributes,
        [
            testPlanReportAssociation(testPlanReportAttributes),
            testResultAssociation(testResultAttributes),
            userAssociation(userAttributes)
        ],
        pagination
    );
};

/**
 * @param {object} createParams - values to be used to create the TestPlanRun
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {Promise<*>}
 */
const createTestPlanRun = async (
    { testerUserId, testPlanReportId },
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    // shouldn't have duplicate entries for a tester
    const existingTestPlanRuns = await getTestPlanRuns(
        '',
        {
            testerUserId,
            testPlanReportId
        },
        testPlanRunAttributes,
        testPlanReportAttributes,
        testResultAttributes,
        userAttributes
    );
    if (existingTestPlanRuns.length) return existingTestPlanRuns[0];

    const testPlanRunResult = await ModelService.create(TestPlanRun, {
        testerUserId,
        testPlanReportId
    });
    const { id } = testPlanRunResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(TestPlanRun, id, testPlanRunAttributes, [
        testPlanReportAssociation(testPlanReportAttributes),
        testResultAssociation(testResultAttributes),
        userAssociation(userAttributes)
    ]);
};

/**
 * @param {number} id - id of the TestPlanRun record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateTestPlanRun = async (
    id,
    { testerUserId },
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    await ModelService.update(TestPlanRun, { id }, { testerUserId });

    return await ModelService.getById(TestPlanRun, id, testPlanRunAttributes, [
        testPlanReportAssociation(testPlanReportAttributes),
        testResultAssociation(testResultAttributes),
        userAssociation(userAttributes)
    ]);
};

/**
 * @param {number} id - id of the TestPlanRun record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeTestPlanRun = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(TestPlanRun, id, deleteOptions);
};

module.exports = {
    // TestPlanRun
    getTestPlanRunById,
    getTestPlanRuns,
    createTestPlanRun,
    updateTestPlanRun,
    removeTestPlanRun
};
