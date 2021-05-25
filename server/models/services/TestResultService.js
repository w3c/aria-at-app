const ModelService = require('./ModelService');
const {
    TEST_RESULT_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES
} = require('./helpers');
const { TestResult } = require('../');

// association helpers to be included with Models' results

/**
 * @param testPlanRunAttributes - TestPlanRun attributes
 * @returns {{association: string, attributes: string[], through: {attributes: string[]}}}
 */
const testPlanRunAssociation = testPlanRunAttributes => ({
    association: 'testPlanRunObject',
    attributes: testPlanRunAttributes
});

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} queryParams - attributes of TestResult to be retrieved
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getTestResultByQuery = async (
    queryParams,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES
) => {
    if (!queryParams) throw new Error('No queryParams found');

    return await ModelService.getByQuery(
        TestResult,
        queryParams,
        testResultAttributes,
        [testPlanRunAssociation(testPlanRunAttributes)]
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getTestResults = async (
    search,
    filter = {}, // pass to 'where' for top level TestResult object
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };

    return await ModelService.get(
        TestResult,
        where,
        testResultAttributes,
        [testPlanRunAssociation(testPlanRunAttributes)],
        pagination
    );
};

/**
 * @param {object} createParams - values to be used to create the Role
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @returns {Promise<*>}
 */
const createTestResult = async (
    createParams,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES
) => {
    const testResult = await ModelService.create(TestResult, createParams);
    const { testPlanRun, startedAt } = testResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await getTestResultByQuery(
        { testPlanRun, startedAt },
        testResultAttributes,
        testPlanRunAttributes
    );
};

/**
 * @param {object} queryParams - attributes of TestResult to be retrieved
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateTestResult = async (
    queryParams,
    updateParams = {},
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES
) => {
    if (!queryParams) throw new Error('No queryParams found');

    await ModelService.update(TestResult, queryParams, updateParams);
    const {
        testPlanRun: queryParamsTestPlanRun,
        startedAt: queryParamsStartedAt
    } = queryParams;
    const {
        testPlanRun: updateParamsTestPlanRun,
        startedAt: updateParamsStartedAt
    } = updateParams;

    return await getTestResultByQuery(
        {
            testPlanRun: updateParamsTestPlanRun || queryParamsTestPlanRun,
            startedAt: updateParamsStartedAt || queryParamsStartedAt
        },
        testResultAttributes,
        testPlanRunAttributes
    );
};

/**
 * @param {object} queryParams - attributes of TestResult record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeTestResult = async (queryParams, deleteOptions) => {
    return await ModelService.removeByQuery(
        TestResult,
        queryParams,
        deleteOptions
    );
};

module.exports = {
    // Basic CRUD
    getTestResultByQuery,
    getTestResults,
    createTestResult,
    updateTestResult,
    removeTestResult
};
