const ModelService = require('./ModelService');
const {
    TEST_PLAN_RUN_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    USER_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    AT_ATTRIBUTES,
    BROWSER_ATTRIBUTES,
    TEST_PLAN_ATTRIBUTES
} = require('./helpers');
const { TestPlanRun, sequelize } = require('../');

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
 * @param {string[]} atAttributes - AT attributes
 * @param {string[]} browserAttributes - Browser attributes
 * @param {string[]} userAttributes - User attributes
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
        testPlanRunAssociation(testPlanRunAttributes, userAttributes),
        // eslint-disable-next-line no-use-before-define
        testPlanVersionAssociation(
            testPlanVersionAttributes,
            testPlanAttributes
        ),
        // eslint-disable-next-line no-use-before-define
        atAssociation(atAttributes),
        // eslint-disable-next-line no-use-before-define
        browserAssociation(browserAttributes)
    ]
});

/**
 * When the test plan run model loads the test plan report, it should still load
 * all the test plan runs, otherwise you would not be able to compare the
 * current run to the complete list of runs.
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
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanVersionAssociation = (
    testPlanVersionAttributes,
    testPlanAttributes
) => ({
    association: 'testPlanVersion',
    attributes: testPlanVersionAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        testPlanAssociation(testPlanAttributes)
    ]
});

/**
 * @param {string[]} testPlanAttributes - TestPlan attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanAssociation = testPlanAttributes => ({
    association: 'testPlan',
    attributes: testPlanAttributes
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

// TestPlanRun

/**
 * @param {object} options
 * @param {number} options.id - id of TestPlanRun to be retrieved
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.nestedTestPlanRunAttributes - TestPlanRun attributes associated to the TestPlanReport model to be returned
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanRunById = async ({
    id,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    nestedTestPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    return ModelService.getById(TestPlanRun, {
        id,
        attributes: testPlanRunAttributes,
        include: [
            testPlanReportAssociation(
                testPlanReportAttributes,
                nestedTestPlanRunAttributes,
                testPlanVersionAttributes,
                testPlanAttributes,
                atAttributes,
                browserAttributes,
                userAttributes
            ),
            userAssociation(userAttributes)
        ],
        transaction
    });
};

/**
 * @param {object} options
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.nestedTestPlanRunAttributes - TestPlanRun attributes associated to the TestPlanReport model to be returned
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
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
const getTestPlanRuns = async ({
    // search, // Nothing to search
    where = {},
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    nestedTestPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {},
    transaction
}) => {
    // search and filtering options
    return ModelService.get(TestPlanRun, {
        where,
        attributes: testPlanRunAttributes,
        include: [
            testPlanReportAssociation(
                testPlanReportAttributes,
                nestedTestPlanRunAttributes,
                testPlanVersionAttributes,
                testPlanAttributes,
                atAttributes,
                browserAttributes,
                userAttributes
            ),
            userAssociation(userAttributes)
        ],
        pagination,
        transaction
    });
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the TestPlanRun
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.nestedTestPlanRunAttributes - TestPlanRun attributes associated to the TestPlanReport model to be returned
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlanRun = async ({
    values: {
        testerUserId,
        testPlanReportId,
        testResults = [],
        isAutomated = false
    },
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    nestedTestPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    // shouldn'transaction have duplicate entries for a tester unless it's automated
    if (!isAutomated) {
        const existingTestPlanRuns = await getTestPlanRuns({
            where: {
                testerUserId,
                testPlanReportId
            },
            testPlanRunAttributes,
            nestedTestPlanRunAttributes,
            testPlanReportAttributes,
            testPlanVersionAttributes,
            testPlanAttributes,
            atAttributes,
            browserAttributes,
            userAttributes,
            transaction
        });
        if (existingTestPlanRuns.length) return existingTestPlanRuns[0];
    }

    const testPlanRunResult = await ModelService.create(TestPlanRun, {
        values: {
            testerUserId,
            testPlanReportId,
            testResults,
            initiatedByAutomation: isAutomated
        },
        transaction
    });
    const { id } = testPlanRunResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return ModelService.getById(TestPlanRun, {
        id,
        attributes: testPlanRunAttributes,
        include: [
            testPlanReportAssociation(
                testPlanReportAttributes,
                nestedTestPlanRunAttributes,
                testPlanVersionAttributes,
                testPlanAttributes,
                atAttributes,
                browserAttributes,
                userAttributes
            ),
            userAssociation(userAttributes)
        ],
        transaction
    });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the TestPlanRun record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.nestedTestPlanRunAttributes - TestPlanRun attributes associated to the TestPlanReport model to be returned
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTestPlanRunById = async ({
    id,
    values: { testerUserId, testResults },
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    nestedTestPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    await ModelService.update(TestPlanRun, {
        where: { id },
        values: { testResults, testerUserId },
        transaction
    });
    return ModelService.getById(TestPlanRun, {
        id,
        attributes: testPlanRunAttributes,
        include: [
            testPlanReportAssociation(
                testPlanReportAttributes,
                nestedTestPlanRunAttributes,
                testPlanVersionAttributes,
                testPlanAttributes,
                atAttributes,
                browserAttributes,
                userAttributes
            ),
            userAssociation(userAttributes)
        ],
        transaction
    });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the TestPlanRun record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeTestPlanRunById = async ({ id, truncate = false, transaction }) => {
    return ModelService.removeById(TestPlanRun, { id, truncate, transaction });
};

/**
 * @param {number} where - conditions to be passed to Sequelize's where clause
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeTestPlanRunByQuery = async ({
    where: { testerUserId, testPlanReportId },
    truncate = false,
    transaction
}) => {
    const deleteWhere =
        testerUserId === undefined
            ? { testPlanReportId }
            : { testPlanReportId, testerUserId };
    return ModelService.removeByQuery(TestPlanRun, {
        where: deleteWhere,
        truncate,
        transaction
    });
};

/**
 * @param {object} options
 * @param {number} options.where - conditions to be passed to Sequelize's where clause
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeTestPlanRunResultsByQuery = async ({
    where: { testerUserId, testPlanReportId },
    transaction
}) => {
    return ModelService.update(TestPlanRun, {
        where: { testerUserId, testPlanReportId },
        values: { testResults: [] },
        transaction
    });
};

/**
 * Allows you to check if a given AtVersion is in use by any test results.
 * @param {number} atVersionId - An AT version ID
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns
 */
const getTestResultsUsingAtVersion = async (atVersionId, { transaction }) => {
    const [results] = await sequelize.query(
        `
            WITH "testPlanRunTestResult" AS (
                SELECT
                    id,
                    jsonb_array_elements("testResults") AS "testResult"
                FROM "TestPlanRun"
            )
            SELECT
                id AS "testPlanRunId",
                "testResult" ->> 'id' AS "testResultId"
            FROM "testPlanRunTestResult"
            WHERE "testResult" ->> 'atVersionId' = ?
        `,
        { replacements: [atVersionId], transaction }
    );

    return results;
};

module.exports = {
    // TestPlanRun
    getTestPlanRunById,
    getTestPlanRuns,
    createTestPlanRun,
    updateTestPlanRunById,
    removeTestPlanRunById,
    removeTestPlanRunByQuery,
    removeTestPlanRunResultsByQuery,

    // Custom functions
    getTestResultsUsingAtVersion
};
