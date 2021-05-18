const ModelService = require('./ModelService');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES,
    TEST_RESULT_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport, TestPlanRun } = require('../index');

// Section :- association helpers to be included with Models' results
const testPlanRunAssociation = (
    testPlanRunAttributes,
    userAttributes,
    testResultAttributes
) => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        userAssociation(userAttributes),
        // eslint-disable-next-line no-use-before-define
        testResultAssociation(testResultAttributes)
    ]
});

const testPlanAssociation = testPlanAttributes => ({
    association: 'testPlanObject', // resolver will have to remap this to 'testPlan' after the attributes have been successfully pulled; 'testPlan' conflicts on this model as the id
    attributes: testPlanAttributes
});

const testPlanTargetAssociation = testPlanTargetAttributes => ({
    association: 'testPlanTargetObject', // resolver will have to remap this to 'testPlanTarget' after the attributes have been successfully pulled; 'testPlanTarget' conflicts on this model as the id
    attributes: testPlanTargetAttributes
});

const userAssociation = userAttributes => ({
    association: 'testerObject', // resolver will have to remap this to 'tester' after the attributes have been successfully pulled; 'tester' conflicts on this model as the id
    attributes: userAttributes
});

const testResultAssociation = testResultAttributes => ({
    association: 'testResults',
    attributes: testResultAttributes
});

/**
 * NB. Pass @param {roleAttributes} or @param {testPlanRunAttributes} as '[]' to exclude that related association
 * @param {number} id
 * @param {string[]} testPlanReportAttributes
 * @param {string[]} testPlanRunAttributes
 * @param {string[]} testPlanAttributes
 * @param {string[]} testPlanTargetAttributes
 * @param {string[]} userAttributes
 * @param {string[]} testResultAttributes
 * @returns {Promise<Model|object>}
 */
const getTestPlanReportById = async (
    id,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    // check to see if 'canonicalRun' has been requested; custom attribute handling required
    const canonicalRunKeyFound = testPlanReportAttributes.some(
        key => key === 'canonicalRun'
    );

    // required to be used to determine whether or not to actually return 'canonicalRun'; TestPlan.publishStatus MUST be 'final' for 'canonicalRun' to be returned
    const testPlanReportPublishStatusFound = testPlanReportAttributes.some(
        key => key === 'publishStatus'
    );
    const testPlanParsedTestFound = testPlanAttributes.some(
        key => key === 'parsedTest'
    );
    const testPlanRunAttributesFound = testPlanAttributes.length;

    if (canonicalRunKeyFound) {
        testPlanReportAttributes = [
            ...testPlanReportAttributes,
            'publishStatus'
        ];
        testPlanAttributes = [...testPlanAttributes, 'parsedTest'];
        testPlanRunAttributes = [...testPlanRunAttributes, 'tester'];
    }

    // filter out 'canonicalRun' so it doesn't pollute attributes being passed to sequelize structure
    testPlanReportAttributes = testPlanReportAttributes.filter(
        key => key !== 'canonicalRun'
    );

    let result = await ModelService.getById(
        TestPlanReport,
        id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes,
                userAttributes,
                testResultAttributes
            ),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );

    if (canonicalRunKeyFound) {
        // add canonicalRun to result which is built from `testPlanObject.parsedTest`
        const testPlanReport = result.get();

        // cleanup attributes that weren't actually requested [start]
        if (!testPlanReportPublishStatusFound)
            delete testPlanReport.publishStatus;

        if (!testPlanParsedTestFound) {
            // delete only that key in case attributes attributes were requested
            if (Object.keys(testPlanReport.testPlanObject).length > 1)
                delete testPlanReport.testPlanObject.parsedTest;
            else delete testPlanReport.testPlanObject;
        }

        if (!testPlanRunAttributesFound) delete testPlanReport.testPlanRuns;
        // cleanup attributes that weren't actually requested [end]

        if (testPlanReport.publishStatus === TestPlanReport.FINAL) {
            testPlanReport.canonicalRun = {
                title: '',
                passedAssertions:
                    result.testPlanRuns[0].testResults.length || 0,
                totalAssertions:
                    result.testPlanObject.parsedTest.maximumInputCount ||
                    result.testPlanObject.parsedTest.testActions.length
            };
        }
        return testPlanReport;
    }

    return result;
};

/**
 * @param search
 * @param filter
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @param testResultAttributes
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enable})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enable})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enable}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enable=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getTestPlanReports = async (
    search,
    filter = {},
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };

    // check to see if 'canonicalRun' has been requested; custom attribute handling required
    const canonicalRunKeyFound = testPlanReportAttributes.some(
        key => key === 'canonicalRun'
    );

    // required to be used to determine whether or not to actually return 'canonicalRun'; TestPlan.publishStatus MUST be 'final' for 'canonicalRun' to be returned
    const testPlanReportPublishStatusFound = testPlanReportAttributes.some(
        key => key === 'publishStatus'
    );
    const testPlanParsedTestFound = testPlanAttributes.some(
        key => key === 'parsedTest'
    );
    const testPlanRunAttributesFound = testPlanAttributes.length;

    if (canonicalRunKeyFound) {
        testPlanReportAttributes = [
            ...testPlanReportAttributes,
            'publishStatus'
        ];
        testPlanAttributes = [...testPlanAttributes, 'parsedTest'];
        testPlanRunAttributes = [...testPlanRunAttributes, 'tester'];
    }

    // filter out 'canonicalRun' so it doesn't pollute attributes being passed to sequelize structure
    testPlanReportAttributes = testPlanReportAttributes.filter(
        key => key !== 'canonicalRun'
    );

    let results = await ModelService.get(
        TestPlanReport,
        where,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes,
                userAttributes,
                testResultAttributes
            ),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ],
        pagination
    );

    if (canonicalRunKeyFound) {
        // structure of results will be different
        const { enable: enablePagination } = pagination;

        if (enablePagination) {
            // add canonicalRun to result which is built from `testPlanObject.parsedTest`
            results.data.map(result => {
                const testPlanReport = result.get();

                // cleanup attributes that weren't actually requested [start]
                if (!testPlanReportPublishStatusFound)
                    delete testPlanReport.publishStatus;

                if (!testPlanParsedTestFound) {
                    // delete only that key in case attributes attributes were requested
                    if (Object.keys(testPlanReport.testPlanObject).length > 1)
                        delete testPlanReport.testPlanObject.parsedTest;
                    else delete testPlanReport.testPlanObject;
                }

                if (!testPlanRunAttributesFound)
                    delete testPlanReport.testPlanRuns;
                // cleanup attributes that weren't actually requested [end]

                if (testPlanReport.publishStatus === TestPlanReport.FINAL) {
                    testPlanReport.canonicalRun = {
                        title: '',
                        passedAssertions:
                            result.testPlanRuns[0].testResults.length || 0,
                        totalAssertions:
                            result.testPlanObject.parsedTest
                                .maximumInputCount ||
                            result.testPlanObject.parsedTest.testActions.length
                    };
                }
                return testPlanReport;
            });
        } else {
            // add canonicalRun to result which is built from `testPlanObject.parsedTest`
            results.map(result => {
                const testPlanReport = result.get();

                // cleanup attributes that weren't actually requested [start]
                if (!testPlanReportPublishStatusFound)
                    delete testPlanReport.publishStatus;

                if (!testPlanParsedTestFound) {
                    // delete only that key in case attributes attributes were requested
                    if (Object.keys(testPlanReport.testPlanObject).length > 1)
                        delete testPlanReport.testPlanObject.parsedTest;
                    else delete testPlanReport.testPlanObject;
                }

                if (!testPlanRunAttributesFound)
                    delete testPlanReport.testPlanRuns;
                // cleanup attributes that weren't actually requested [end]

                if (testPlanReport.publishStatus === TestPlanReport.FINAL) {
                    testPlanReport.canonicalRun = {
                        title: '',
                        passedAssertions:
                            result.testPlanRuns[0].testResults.length || 0,
                        totalAssertions:
                            result.testPlanObject.parsedTest
                                .maximumInputCount ||
                            result.testPlanObject.parsedTest.testActions.length
                    };
                }
                return testPlanReport;
            });
        }
    }

    return results;
};

/**
 * @param id
 * @param updateParams
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @param testResultAttributes
 * @returns {Promise<void>}
 */
const updateTestPlanReport = async (
    id,
    { publishStatus, coveragePercent, testPlanTarget, testPlan },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    await ModelService.update(
        TestPlanReport,
        { id },
        { publishStatus, coveragePercent, testPlanTarget, testPlan }
    );

    return await ModelService.getById(
        TestPlanReport,
        id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes,
                userAttributes,
                testResultAttributes
            ),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );
};

// Section :- Custom Functions

/**
 * AssignTester
 * This assumes a TestPlanReport with testPlanReportId exists and a User with userId exists
 * @param testPlanReportId
 * @param userId
 * @param isManuallyTested
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @param testResultAttributes
 * @returns {Promise<*>}
 */
const assignTestPlanReportToUser = async (
    testPlanReportId,
    userId,
    isManuallyTested = false,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    // TestPlanRun has to be created for that user
    await ModelService.create(TestPlanRun, {
        testPlanReport: testPlanReportId,
        tester: userId,
        isManuallyTested
    });

    return await ModelService.get(
        TestPlanReport,
        {},
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes,
                userAttributes,
                testResultAttributes
            ),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );
};

/**
 * RemoveReportTester
 * This assumes a TestPlanReport with testPlanReportId exists and a User with userId exists
 * @param testPlanReportId
 * @param userId
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @param testResultAttributes
 * @returns {Promise<*>}
 */
const removeTestPlanReportForUser = async (
    testPlanReportId,
    userId,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    // TestPlanRun had have been created for that user
    await ModelService.removeByQuery(TestPlanRun, {
        testPlanReport: testPlanReportId,
        tester: userId
    });

    return await ModelService.get(
        TestPlanReport,
        {},
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes,
                userAttributes,
                testResultAttributes
            ),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );
};

/**
 *
 * @param testPlanReportId
 * @param publishStatus
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @param testResultAttributes
 * @returns {Promise<void>}
 */
const updateTestPlanReportStatus = async (
    testPlanReportId,
    publishStatus,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    return await updateTestPlanReport(
        testPlanReportId,
        { publishStatus },
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanAttributes,
        testPlanTargetAttributes,
        userAttributes,
        testResultAttributes
    );
};

module.exports = {
    // Basic CRUD
    getTestPlanReportById,
    getTestPlanReports,
    updateTestPlanReport,

    // Custom Functions : Test Queue Mutations
    assignTestPlanReportToUser,
    removeTestPlanReportForUser,
    updateTestPlanReportStatus,

    // Constants
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES,
    TEST_RESULT_ATTRIBUTES
};
