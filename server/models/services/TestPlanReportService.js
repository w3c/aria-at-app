const { sequelize } = require('../');
const ModelService = require('./ModelService');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    AT_ATTRIBUTES,
    BROWSER_ATTRIBUTES,
    USER_ATTRIBUTES,
    AT_VERSION_ATTRIBUTES,
    BROWSER_VERSION_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport } = require('../');

// association helpers to be included with Models' results

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
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanVersionAssociation = testPlanVersionAttributes => ({
    association: 'testPlanVersion',
    attributes: testPlanVersionAttributes
});

/**
 * @param {string[]} atAttributes - AT attributes
 * @param {string[]} atVersionAttributes - AT version attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = (atAttributes, atVersionAttributes) => ({
    association: 'at',
    attributes: atAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        atVersionAssociation(atVersionAttributes)
    ]
});

/**
 * @param {string[]} atVersionAttributes - AT version attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atVersionAssociation = atVersionAttributes => ({
    association: 'atVersions',
    attributes: atVersionAttributes
});

/**
 * @param {string[]} browserAttributes - Browser attributes
 * @param {string[]} browserVersionAttributes - Browser version attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserAssociation = (browserAttributes, browserVersionAttributes) => ({
    association: 'browser',
    attributes: browserAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        browserVersionAssociation(browserVersionAttributes)
    ]
});

/**
 * @param {string[]} browserVersionAttributes - Browser version attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserVersionAssociation = browserVersionAttributes => ({
    association: 'browserVersions',
    attributes: browserVersionAttributes
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
 * @param {number} id - unique id of the TestPlanReport model being queried
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes - At version attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes - Browser version attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanReportById = async (
    id,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    return await ModelService.getById(
        TestPlanReport,
        id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes.concat([
                    [
                        sequelize.literal(`( WITH testPlanRunResult AS ( SELECT jsonb_array_elements("testResults") AS results )
                                            SELECT COUNT(*)
                                                FROM testPlanRunResult
                                                WHERE (testPlanRunResult.results -> 'completedAt') IS NOT NULL
                                                AND (testPlanRunResult.results -> 'completedAt') != 'null' )`),
                        'testResultsLength'
                    ]
                ]),
                userAttributes
            ),
            testPlanVersionAssociation(
                testPlanVersionAttributes.concat([
                    [
                        sequelize.literal(`( WITH testPlanVersionResult AS ( SELECT jsonb_array_elements("tests") AS results )
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
                    ]
                ])
            ),
            atAssociation(atAttributes, atVersionAttributes),
            browserAssociation(browserAttributes, browserVersionAttributes)
        ],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes - At version attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes - Browser version attributes to be returned in the result
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
const getTestPlanReports = async (
    search,
    filter = {},
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };

    return await ModelService.get(
        TestPlanReport,
        where,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes.concat([
                    [
                        sequelize.literal(`( WITH testPlanRunResult AS ( SELECT jsonb_array_elements("testResults") AS results )
                                            SELECT COUNT(*)
                                                FROM testPlanRunResult
                                                WHERE (testPlanRunResult.results -> 'completedAt') IS NOT NULL
                                                AND (testPlanRunResult.results -> 'completedAt') != 'null' )`),
                        'testResultsLength'
                    ]
                ]),
                userAttributes
            ),
            testPlanVersionAssociation(
                testPlanVersionAttributes.concat([
                    [
                        sequelize.literal(`( WITH testPlanVersionResult AS ( SELECT jsonb_array_elements("tests") AS results )
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
                    ]
                ])
            ),
            atAssociation(atAttributes, atVersionAttributes),
            browserAssociation(browserAttributes, browserVersionAttributes)
        ],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the TestPlanReport
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes - At version attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes - Browser version attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlanReport = async (
    { status, testPlanVersionId, atId, browserId },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options
) => {
    const testPlanReportResult = await ModelService.create(
        TestPlanReport,
        { status, testPlanVersionId, atId, browserId },
        options
    );

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(
        TestPlanReport,
        testPlanReportResult.id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanVersionAssociation(testPlanVersionAttributes),
            atAssociation(atAttributes, atVersionAttributes),
            browserAssociation(browserAttributes, browserVersionAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - unique id of the TestPlanReport model being to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTestPlanReport = async (
    id,
    { status, testPlanTargetId, testPlanVersionId },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(
        TestPlanReport,
        { id },
        { status, testPlanTargetId, testPlanVersionId },
        options
    );

    // call custom this.getById if custom attributes are being accounted for
    return await getTestPlanReportById(
        id,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        atAttributes,
        atVersionAttributes,
        browserAttributes,
        browserVersionAttributes,
        userAttributes
    );
};

/**
 * @param {number} id - id of the TestPlanRun record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeTestPlanReport = async (
    id,
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeById(TestPlanReport, id, deleteOptions);
};

/**
 * Gets one TestPlanReport, or creates it if it doesn't exist, and then optionally updates it. Supports nested / associated values.
 * @param {*} nestedGetOrCreateValues - These values will be used to find a matching record, or they will be used to create one
 * @param {*} nestedUpdateValues - Values which will be used when a record is found or created, but not used for the initial find
 * @param {*} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {*} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {*} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {*} atAttributes - At attributes to be returned in the result
 * @param {*} browserAttributes - Browser attributes to be returned in the result
 * @param {*} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[*, [*]]}
 */
const getOrCreateTestPlanReport = async (
    { testPlanVersionId, atId, browserId },
    { status } = {},
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    const accumulatedResults = await ModelService.nestedGetOrCreate(
        [
            {
                get: getTestPlanReports,
                create: createTestPlanReport,
                update: updateTestPlanReport,
                values: { testPlanVersionId, atId, browserId },
                updateValues: { status },
                returnAttributes: [null, [], [], [], [], [], [], []]
            }
        ],
        { transaction: options.transaction }
    );

    const [
        [{ id: testPlanReportId }, isNewTestPlanReport]
    ] = accumulatedResults;

    const testPlanReport = await getTestPlanReportById(
        testPlanReportId,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        atAttributes,
        atVersionAttributes,
        browserAttributes,
        browserVersionAttributes,
        userAttributes,
        { transaction: options.transaction }
    );

    const created = isNewTestPlanReport ? [{ testPlanReportId }] : [];

    return [testPlanReport, created];
};

module.exports = {
    // Basic CRUD
    getTestPlanReportById,
    getTestPlanReports,
    createTestPlanReport,
    updateTestPlanReport,
    removeTestPlanReport,
    getOrCreateTestPlanReport
};
