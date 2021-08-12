const ModelService = require('./ModelService');
const {
    TEST_PLAN_RUN_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    USER_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES
} = require('./helpers');
const { TestPlanRun } = require('../');

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanReportAssociation = (
    testPlanReportAttributes,
    testPlanRunAttributes,
    testPlanVersionAttributes,
    testPlanTargetAttributes,
    userAttributes
) => ({
    association: 'testPlanReport',
    attributes: testPlanReportAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        testPlanRunAssociation(testPlanRunAttributes, userAttributes),
        // eslint-disable-next-line no-use-before-define
        testPlanVersionAssociation(testPlanVersionAttributes),
        // eslint-disable-next-line no-use-before-define
        testPlanTargetAssociation(testPlanTargetAttributes)
    ]
});

/**
 * When the test plan run model loads the test plan report, it should still load
 * all the test plan runs, otherwise you would not be able to compare the
 * current run to the complete list of runs.
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
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
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanVersionAssociation = testPlanVersionAttributes => ({
    association: 'testPlanVersion',
    attributes: testPlanVersionAttributes
});

/**
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanTargetAssociation = testPlanTargetAttributes => ({
    association: 'testPlanTarget',
    attributes: testPlanTargetAttributes
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
 * @param {string[]} nestedTestPlanRunAttributes - TestPlanRun attributes associated to the TestPlanReport model to be returned
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanRunById = async (
    id,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    nestedTestPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    return ModelService.getById(
        TestPlanRun,
        id,
        testPlanRunAttributes,
        [
            testPlanReportAssociation(
                testPlanReportAttributes,
                nestedTestPlanRunAttributes,
                testPlanVersionAttributes,
                testPlanTargetAttributes,
                userAttributes
            ),
            userAssociation(userAttributes)
        ],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} nestedTestPlanRunAttributes - TestPlanRun attributes associated to the TestPlanReport model to be returned
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result

 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanRuns = async (
    search,
    filter = {},
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    nestedTestPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };

    return ModelService.get(
        TestPlanRun,
        where,
        testPlanRunAttributes,
        [
            testPlanReportAssociation(
                testPlanReportAttributes,
                nestedTestPlanRunAttributes,
                testPlanVersionAttributes,
                testPlanTargetAttributes,
                userAttributes
            ),
            userAssociation(userAttributes)
        ],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the TestPlanRun
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} nestedTestPlanRunAttributes - TestPlanRun attributes associated to the TestPlanReport model to be returned
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlanRun = async (
    { testerUserId, testPlanReportId, testResults },
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    nestedTestPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    // shouldn't have duplicate entries for a tester
    const existingTestPlanRuns = await getTestPlanRuns(
        '',
        {
            testerUserId,
            testPlanReportId
        },
        testPlanRunAttributes,
        nestedTestPlanRunAttributes,
        testPlanReportAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        userAttributes,
        options
    );
    if (existingTestPlanRuns.length) return existingTestPlanRuns[0];

    const testPlanRunResult = await ModelService.create(
        TestPlanRun,
        {
            testerUserId,
            testPlanReportId,
            testResults
        },
        options
    );
    const { id } = testPlanRunResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(
        TestPlanRun,
        id,
        testPlanRunAttributes,
        [
            testPlanReportAssociation(
                testPlanReportAttributes,
                nestedTestPlanRunAttributes,
                testPlanVersionAttributes,
                testPlanTargetAttributes,
                userAttributes
            ),
            userAssociation(userAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - id of the TestPlanRun record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} nestedTestPlanRunAttributes - TestPlanRun attributes associated to the TestPlanReport model to be returned
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTestPlanRun = async (
    id,
    { testResults },
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    nestedTestPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(TestPlanRun, { id }, { testResults });

    return await ModelService.getById(
        TestPlanRun,
        id,
        testPlanRunAttributes,
        [
            testPlanReportAssociation(
                testPlanReportAttributes,
                nestedTestPlanRunAttributes,
                testPlanVersionAttributes,
                testPlanTargetAttributes,
                userAttributes
            ),
            userAssociation(userAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - id of the TestPlanRun record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeTestPlanRun = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(TestPlanRun, id, deleteOptions);
};

/**
 * @param {number} queryParams - conditions to be passed to Sequelize's where clause
 * @param {object} deleteOptions - Sequelize-specific deletion options
 * @returns {Promise<boolean>}
 */
const removeTestPlanRunByQuery = async (
    { testerUserId, testPlanReportId },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeByQuery(
        TestPlanRun,
        { testerUserId, testPlanReportId },
        deleteOptions
    );
};

/**
 * @param {number} queryParams - conditions to be passed to Sequelize's where clause
 * @returns {Promise<boolean>}
 */
const removeTestPlanRunResultsByQuery = async ({
    testerUserId,
    testPlanReportId
}) => {
    return await ModelService.update(
        TestPlanRun,
        { testerUserId, testPlanReportId },
        { testResults: [] }
    );
};

module.exports = {
    // TestPlanRun
    getTestPlanRunById,
    getTestPlanRuns,
    createTestPlanRun,
    updateTestPlanRun,
    removeTestPlanRun,
    removeTestPlanRunByQuery,
    removeTestPlanRunResultsByQuery
};
