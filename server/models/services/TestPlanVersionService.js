const ModelService = require('./ModelService');
const {
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES
} = require('./helpers');
const { Sequelize, sequelize, TestPlanVersion } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanReportAssociation = (
    testPlanReportAttributes,
    testPlanTargetAttributes,
    testPlanRunAttributes,
    userAttributes
) => ({
    association: 'testPlanReports',
    attributes: testPlanReportAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        testPlanTargetAssociation(testPlanTargetAttributes),
        // eslint-disable-next-line no-use-before-define
        testPlanRunAssociation(testPlanRunAttributes, userAttributes)
    ]
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
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanVersionById = async (
    id,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    return await ModelService.getById(
        TestPlanVersion,
        id,
        testPlanVersionAttributes,
        [
            testPlanReportAssociation(
                testPlanReportAttributes,
                testPlanTargetAttributes,
                testPlanRunAttributes,
                userAttributes
            )
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
const getTestPlanVersions = async (
    search,
    filter = {},
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, title: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        TestPlanVersion,
        where,
        testPlanVersionAttributes,
        [
            testPlanReportAssociation(
                testPlanReportAttributes,
                testPlanTargetAttributes,
                testPlanRunAttributes,
                userAttributes
            )
        ],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the TestPlanVersion
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlanVersion = async (
    {
        title,
        status,
        gitSha,
        gitMessage,
        exampleUrl,
        updatedAt,
        metadata,
        tests
    },
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    const testPlanVersionResult = await ModelService.create(TestPlanVersion, {
        title,
        status,
        gitSha,
        gitMessage,
        exampleUrl,
        updatedAt,
        metadata,
        tests
    });
    const { id } = testPlanVersionResult;

    return await getTestPlanVersionById(
        id,
        testPlanVersionAttributes,
        testPlanReportAttributes,
        testPlanTargetAttributes,
        testPlanRunAttributes,
        userAttributes,
        options
    );
};

/**
 * @param {number} id - id of the TestPlanVersion record to be updated
 * @param {object} updateParams - values to be used to updated on the TestPlanVersion
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTestPlanVersion = async (
    id,
    {
        title,
        status,
        gitSha,
        gitMessage,
        exampleUrl,
        updatedAt,
        metadata,
        tests
    },
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(
        TestPlanVersion,
        { id },
        {
            title,
            status,
            gitSha,
            gitMessage,
            exampleUrl,
            updatedAt,
            metadata,
            tests
        },
        options
    );

    return await getTestPlanVersionById(
        id,
        testPlanVersionAttributes,
        testPlanReportAttributes,
        testPlanTargetAttributes,
        testPlanRunAttributes,
        userAttributes,
        options
    );
};

/**
 * Custom function to load the TestPlan GraphQL type, which is derived from the TestPlanVersion table.
 * @param {object} options
 * @param {boolean} options.includeLatestTestPlanVersion - Whether to load the latestTestPlanVersion field which requires multiple queries.
 * @param {boolean} options.includeTestPlanVersions - Whether to load the testPlanVersions field which requires multiple queries.
 * @param {boolean} options.id - A single ID to load - mainly here to allow the queries to be reused in the getTestPlanById function.
 * @returns {*} - TestPlans as specified in GraphQL
 */
const getTestPlans = async ({
    includeLatestTestPlanVersion = true,
    includeTestPlanVersions = true,
    id
} = {}) => {
    const getTestPlansAndLatestVersionId = async () => {
        const whereClause = id ? `WHERE metadata->>'directory' = ?` : '';
        // TODO: revisit as part of reporting migration - make directory a
        // column instead of a metadata field
        const [results] = await sequelize.query(
            `
                SELECT * FROM (
                    SELECT DISTINCT
                        ON (metadata->>'directory')
                        metadata->>'directory' as "id",
                        metadata->>'directory' as "directory",
                        id as "latestTestPlanVersionId",
                        "updatedAt"
                    FROM "TestPlanVersion"
                    ${whereClause}
                    ORDER BY metadata->>'directory', "updatedAt" DESC
                ) sub
                ORDER BY "updatedAt"
            `,
            { replacements: [id] }
        );
        return results;
    };

    const getTestPlansWithVersionIds = async () => {
        const having = id ? `HAVING metadata->>'directory' = ?` : '';
        const [results] = await sequelize.query(
            `
                SELECT
                    metadata->>'directory' as id,
                    ARRAY_AGG(id) as "testPlanVersionIds"
                FROM "TestPlanVersion"
                GROUP BY metadata->>'directory'
                ${having}
            `,
            { replacements: [id] }
        );
        return results;
    };

    let testPlans = await getTestPlansAndLatestVersionId();

    if (includeLatestTestPlanVersion) {
        const latestTestPlanVersionIds = testPlans.map(
            testPlan => testPlan.latestTestPlanVersionId
        );
        const latestTestPlanVersions = await getTestPlanVersions('', {
            id: latestTestPlanVersionIds
        });
        testPlans = testPlans.map(testPlan => {
            return {
                ...testPlan,
                latestTestPlanVersion: latestTestPlanVersions.find(
                    testPlanVersion =>
                        testPlanVersion.id === testPlan.latestTestPlanVersionId
                )
            };
        });
    }

    if (includeTestPlanVersions) {
        const testPlansHistoric = await getTestPlansWithVersionIds();
        const testPlanVersions = await getTestPlanVersions();
        testPlans = testPlans.map(testPlan => {
            const { testPlanVersionIds } = testPlansHistoric.find(
                historicTestPlan => historicTestPlan.id === testPlan.id
            );
            return {
                ...testPlan,
                testPlanVersions: testPlanVersionIds.map(testPlanVersionId =>
                    testPlanVersions.find(
                        testPlanVersion =>
                            testPlanVersion.id === testPlanVersionId
                    )
                )
            };
        });
    }

    return testPlans;
};

const getTestPlanById = async id => {
    const result = await getTestPlans({ id });
    return result[0];
};

module.exports = {
    // Basic CRUD
    getTestPlanVersionById,
    getTestPlanVersions,
    createTestPlanVersion,
    updateTestPlanVersion,

    // Custom functions
    getTestPlans,
    getTestPlanById
};
