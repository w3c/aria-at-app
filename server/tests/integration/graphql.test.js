const { gql } = require('apollo-server');
const { difference, uniq: unique } = require('lodash');
const deepFlatFilter = require('../../util/deepFlatFilter');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models/index');
const dbCleaner = require('../util/db-cleaner');
const { getAtVersionByQuery } = require('../../models/services/AtService');
const {
    getBrowserVersionByQuery
} = require('../../models/services/BrowserService');

/**
 * Get a function for making GraphQL queries - as well as functions to check
 * whether any types or any fields were not queried. Note, for this to work,
 * all queried types must include the __typename property.
 * @param {object} options
 * @param {string[]} options.excludedTypeNames - Array with a string for the
 * type names which should not count as missing.
 * @param {array} options.excludedTypeNameAndField - Array of arrays with a
 * string for the type name and a string for the field name which should not
 * count as missing.
 * @returns {object}
 */
const getTypeAwareQuery = async ({
    excludedTypeNames,
    excludedTypeNameAndField
}) => {
    const graphqlFieldsByType = {};
    const graphqlQueriedFieldsByType = {};

    const introspectionResult = await query(
        gql`
            query {
                __schema {
                    types {
                        name
                        kind
                        fields {
                            name
                        }
                    }
                }
            }
        `
    );

    introspectionResult.__schema.types.forEach(graphqlType => {
        if (graphqlType.kind === 'OBJECT') {
            graphqlFieldsByType[graphqlType.name] = graphqlType.fields.map(
                field => field.name
            );
        }
    });

    const trackTypes = result => {
        const fieldSets = deepFlatFilter(result, part => !!part?.__typename);
        fieldSets.forEach(fieldSet => {
            const nonNullOrEmptyFieldNames = Object.entries(fieldSet)
                .filter(keyValue => {
                    const value = keyValue[1];
                    return !(value === null || value?.length === 0);
                })
                .map(keyValue => keyValue[0]);
            graphqlQueriedFieldsByType[fieldSet.__typename] = unique([
                ...(graphqlQueriedFieldsByType[fieldSet.__typename] || []),
                ...nonNullOrEmptyFieldNames
            ]);
        });
    };

    const typeAwareQuery = async (...args) => {
        const result = await query(...args);
        trackTypes(result);
        return result;
    };

    const typeAwareMutate = async (...args) => {
        const result = await mutate(...args);
        trackTypes(result);
        return result;
    };

    const checkForMissingTypes = () => {
        const missingTypes = [];
        Object.keys(graphqlFieldsByType).forEach(typeName => {
            if (
                !graphqlQueriedFieldsByType[typeName] &&
                !excludedTypeNames.includes(typeName) &&
                !typeName.startsWith('__')
            ) {
                missingTypes.push(typeName);
            }
        });
        return missingTypes;
    };

    const checkForMissingFields = () => {
        const missingFieldsByType = {};
        Object.entries(graphqlFieldsByType).forEach(([typeName, fields]) => {
            if (
                excludedTypeNames.includes(typeName) ||
                typeName.startsWith('__')
            ) {
                return;
            }

            const excludedFields = excludedTypeNameAndField
                .filter(each => each[0] === typeName)
                .map(each => each[1]);

            const queriedFields = graphqlQueriedFieldsByType[typeName];
            const allMissingFields = difference(fields, queriedFields);
            const missingFields = difference(allMissingFields, excludedFields);

            if (missingFields.length) {
                missingFieldsByType[typeName] = missingFields;
            }
        });
        return missingFieldsByType;
    };

    return {
        typeAwareQuery,
        typeAwareMutate,
        checkForMissingTypes,
        checkForMissingFields
    };
};

let typeAwareQuery;
let typeAwareMutate;
let checkForMissingTypes;
let checkForMissingFields;

describe('graphql', () => {
    beforeAll(async () => {
        const excludedTypeNames = [
            // Items formatted like this:
            // 'TestResult'
            'Issue',
            'Vendor'
        ];
        const excludedTypeNameAndField = [
            // Items formatted like this:
            // ['TestResult', 'startedAt'],
            ['PopulatedData', 'atVersion'],
            ['PopulatedData', 'browserVersion'],
            ['TestPlanReport', 'issues'],
            ['TestPlanReport', 'vendorReviewStatus'],
            ['TestPlanVersion', 'candidateStatusReachedAt'],
            ['TestPlanVersion', 'recommendedStatusReachedAt'],
            ['TestPlanVersion', 'recommendedStatusTargetDate'],
            ['Test', 'viewers']
        ];
        ({
            typeAwareQuery,
            typeAwareMutate,
            checkForMissingTypes,
            checkForMissingFields
        } = await getTypeAwareQuery({
            excludedTypeNames,
            excludedTypeNameAndField
        }));
    });

    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await db.sequelize.close();
    });

    it('supports querying every type and field in the schema', async () => {
        const { assertionResultId } = await getQueryInputs();

        // eslint-disable-next-line no-unused-vars
        const queryResult = await typeAwareQuery(
            gql`
                query {
                    __typename
                    browsers {
                        __typename
                        id
                        name
                        ats {
                            __typename
                            id
                            name
                        }
                        browserVersions {
                            __typename
                            id
                            name
                        }
                    }
                    ats {
                        __typename
                        id
                        name
                        browsers {
                            __typename
                            id
                            name
                        }
                        atVersions {
                            __typename
                            id
                            name
                            releasedAt
                        }
                    }
                    users {
                        __typename
                        username
                        roles
                    }
                    me {
                        __typename
                        id
                        username
                        roles
                        ats {
                            id
                            name
                        }
                    }
                    testPlan(id: "checkbox") {
                        __typename
                        id
                        directory
                        title
                        latestTestPlanVersion {
                            __typename
                            id
                            title
                            updatedAt
                            gitSha
                            gitMessage
                            updatedAt
                            testPageUrl
                            metadata
                            tests {
                                __typename
                                id
                                rowNumber
                                title
                                ats {
                                    id
                                }
                                atMode
                                scenarios {
                                    __typename
                                    id
                                    at {
                                        id
                                    }
                                    commands {
                                        __typename
                                        id
                                        text
                                    }
                                }
                                assertions {
                                    __typename
                                    id
                                    priority
                                    text
                                }
                            }
                        }
                        testPlanVersions {
                            id
                        }
                    }
                    testPlans {
                        directory
                        title
                    }
                    testPlanVersions {
                        __typename
                        id
                        phase
                        candidateStatusReachedAt
                        recommendedStatusTargetDate
                        recommendedStatusReachedAt
                    }
                    testPlanVersion(id: 1) {
                        __typename
                        id
                        testPlanReports {
                            id
                        }
                        testPlan {
                            id
                            directory
                        }
                    }
                    conflictTestPlanReport: testPlanReport(id: 2) {
                        __typename
                        id
                        status
                        createdAt
                        vendorReviewStatus
                        testPlanVersion {
                            id
                        }
                        at {
                            __typename
                            id
                        }
                        browser {
                            __typename
                            id
                        }
                        runnableTests {
                            __typename
                            id
                            renderableContent
                            renderedUrl
                        }
                        runnableTestsLength
                        draftTestPlanRuns {
                            __typename
                            id
                            tester {
                                username
                            }
                            testResults {
                                __typename
                                id
                                test {
                                    id
                                }
                                atVersion {
                                    __typename
                                    id
                                    name
                                    releasedAt
                                }
                                browserVersion {
                                    __typename
                                    id
                                    name
                                }
                                scenarioResults {
                                    __typename
                                    id
                                    scenario {
                                        id
                                    }
                                    output
                                    assertionResults {
                                        __typename
                                        id
                                        assertion {
                                            id
                                        }
                                        passed
                                        failedReason
                                    }
                                    unexpectedBehaviors {
                                        __typename
                                        id
                                        text
                                        otherUnexpectedBehaviorText
                                    }
                                }
                            }
                            testResultsLength
                        }
                        conflicts {
                            __typename
                            source {
                                locationOfData
                            }
                            conflictingResults {
                                locationOfData
                            }
                        }
                        issues {
                            __typename
                        }
                    }
                    testPlanReport(id: 3) {
                        __typename
                        finalizedTestResults {
                            __typename
                            id
                            startedAt
                            completedAt
                        }
                        metrics
                        conflictsLength
                        atVersions {
                            id
                            name
                            releasedAt
                        }
                        latestAtVersionReleasedAt {
                            id
                            name
                            releasedAt
                        }
                    }
                    testPlanReports {
                        id
                        atVersions {
                            id
                            name
                            releasedAt
                        }
                        latestAtVersionReleasedAt {
                            id
                            name
                            releasedAt
                        }
                    }
                    testPlanRun(id: 3) {
                        __typename
                        id
                        testPlanReport {
                            id
                        }
                    }
                    populateData(locationOfData: {
                        assertionResultId: "${assertionResultId}"
                    }) {
                        __typename
                        locationOfData
                        testPlan {
                            id
                        }
                        testPlanVersion {
                            id
                        }
                        testPlanReport {
                            id
                        }
                        at {
                            id
                        }
                        browser {
                            id
                        }
                        testPlanRun {
                            id
                        }
                        test {
                            id
                        }
                        scenario {
                            id
                        }
                        assertion {
                            id
                        }
                        testResult {
                            id
                        }
                        atVersion {
                            id
                        }
                        browserVersion {
                            id
                        }
                        scenarioResult {
                            id
                        }
                        assertionResult {
                            id
                        }
                    }
                }
            `
        );
        // console.info(queryResult);

        await dbCleaner(async () => {
            const {
                emptyTestResultInput,
                passingTestResultInput,
                testPlanRun1DeletableTestResultId,
                testPlanRun1TestId,
                atVersionId,
                browserVersionId
            } = await getMutationInputs();

            // eslint-disable-next-line no-unused-vars
            const mutationResults = await typeAwareMutate(
                gql`
                    mutation AllMutations(
                        $emptyTestResultInput: TestResultInput!
                        $emptyTestResultId: ID!
                        $passingTestResultInput: TestResultInput!
                        $passingTestResultId: ID!
                        $testPlanRun1DeletableTestResultId: ID!
                        $testPlanRun1TestId: ID!
                        $atVersionId: ID!
                        $browserVersionId: ID!
                    ) {
                        __typename
                        findOrCreateTestPlanReport(
                            input: {
                                testPlanVersionId: 2
                                atId: 2
                                browserId: 2
                            }
                        ) {
                            __typename
                            populatedData {
                                locationOfData
                            }
                            created {
                                locationOfData
                            }
                        }
                        testPlanReport(id: 1) {
                            __typename
                            assignTester(userId: 2) {
                                locationOfData
                            }
                        }
                        reportStatus: testPlanReport(id: 1) {
                            __typename
                            updateStatus(status: CANDIDATE) {
                                locationOfData
                            }
                        }
                        bulkReportStatus: testPlanReport(ids: [1]) {
                            __typename
                            bulkUpdateStatus(status: CANDIDATE) {
                                locationOfData
                            }
                        }
                        updateToTestPlanVersion: testPlanReport(id: 1) {
                            __typename
                            updateTestPlanReportTestPlanVersion(
                                input: {
                                    testPlanVersionId: 34
                                    atId: 1
                                    browserId: 2
                                }
                            ) {
                                locationOfData
                            }
                        }
                        updateTestPlanVersionPhase: testPlanVersion(id: 26) {
                            __typename
                            updatePhase(phase: DRAFT) {
                                locationOfData
                            }
                        }
                        testPlanVersion(id: 3) {
                            __typename
                            updateRecommendedStatusTargetDate(
                                recommendedStatusTargetDate: "2023-12-25"
                            ) {
                                locationOfData
                            }
                        }
                        deleteRun: testPlanReport(id: 2) {
                            __typename
                            deleteTestPlanRun(userId: 2) {
                                locationOfData
                            }
                        }
                        deleteReport: testPlanReport(id: 3) {
                            __typename
                            deleteTestPlanReport
                        }
                        promoteVendorStatus: testPlanReport(id: 6) {
                            __typename
                            promoteVendorReviewStatus(
                                vendorReviewStatus: "READY"
                            ) {
                                testPlanReport {
                                    id
                                }
                            }
                        }
                        testPlanRun(id: 1) {
                            __typename
                            findOrCreateTestResult(
                                testId: $testPlanRun1TestId
                                atVersionId: $atVersionId
                                browserVersionId: $browserVersionId
                            ) {
                                locationOfData
                            }
                        }
                        emptyRun: testPlanRun(id: 2) {
                            __typename
                            deleteTestResults {
                                locationOfData
                            }
                        }
                        testResult(id: $emptyTestResultId) {
                            __typename
                            saveTestResult(input: $emptyTestResultInput) {
                                locationOfData
                            }
                        }
                        submitResult: testResult(id: $passingTestResultId) {
                            __typename
                            submitTestResult(input: $passingTestResultInput) {
                                locationOfData
                            }
                        }
                        deleteResult: testResult(
                            id: $testPlanRun1DeletableTestResultId
                        ) {
                            __typename
                            deleteTestResult {
                                locationOfData
                            }
                        }
                        updateMe(input: { atIds: [1, 2, 3] }) {
                            ats {
                                id
                            }
                        }
                        at(id: 1) {
                            __typename
                            findOrCreateAtVersion(
                                input: {
                                    name: "2022.5.2"
                                    releasedAt: "2022/05/02"
                                }
                            ) {
                                id
                                name
                                releasedAt
                            }
                        }
                        atVersion(id: 1) {
                            __typename
                            updateAtVersion(
                                input: {
                                    name: "2022"
                                    releasedAt: "2022/05/03"
                                }
                            ) {
                                id
                                name
                                releasedAt
                            }
                        }
                        deleteAtVersion: atVersion(id: 3) {
                            __typename
                            deleteAtVersion {
                                __typename
                                isDeleted
                                failedDueToTestResults {
                                    locationOfData
                                }
                            }
                        }
                        browser(id: 1) {
                            __typename
                            findOrCreateBrowserVersion(
                                input: { name: "2022.5.4" }
                            ) {
                                id
                                name
                            }
                        }
                        addViewer(
                            testPlanVersionId: 1
                            testId: "NjgwYeyIyIjoiMSJ9zYxZT"
                        ) {
                            username
                        }
                    }
                `,
                {
                    variables: {
                        emptyTestResultInput,
                        emptyTestResultId: emptyTestResultInput.id,
                        passingTestResultInput,
                        passingTestResultId: passingTestResultInput.id,
                        testPlanRun1DeletableTestResultId,
                        testPlanRun1TestId,
                        atVersionId,
                        browserVersionId
                    }
                }
            );
        });

        expect(() => {
            const missingTypes = checkForMissingTypes();
            if (missingTypes.length) {
                const typeWasOrTypesWere =
                    missingTypes.length === 1 ? 'type was' : 'types were';
                const missingTypesFormatted = missingTypes.join(', ');
                throw new Error(
                    `The following ${typeWasOrTypesWere} not tested: ` +
                        `${missingTypesFormatted}. Either add tests or ` +
                        `explicitly exclude the types by adding the type ` +
                        `name to the excludedTypeNames array. Note this may ` +
                        `also occur if the query is missing the __typename ` +
                        `field or if the field is renamed inside the query.`
                );
            }

            const missingFieldsByTypeName = checkForMissingFields();
            const missingTypeName = Object.keys(missingFieldsByTypeName)[0];
            const missingFields = missingFieldsByTypeName[missingTypeName];
            if (missingTypeName) {
                const fieldOrFields =
                    missingFields.length === 1 ? 'field' : 'fields';
                const fieldsFormatted = missingFields.join(', ');
                throw new Error(
                    `The '${missingTypeName}' query did not include fields ` +
                        `for the following ${fieldOrFields}: ` +
                        `${fieldsFormatted}. Either add tests or add the ` +
                        `typename and field to the excludedTypeNameAndField ` +
                        `array. Note that null or an empty array does not ` +
                        `count!`
                );
            }
        }).not.toThrow();
    });
});

const getQueryInputs = async () => {
    const { testPlanRun } = await query(gql`
        query {
            testPlanRun(id: 1) {
                testResults {
                    scenarioResults {
                        assertionResults {
                            id
                        }
                    }
                }
            }
        }
    `);

    return {
        assertionResultId:
            testPlanRun.testResults[0].scenarioResults[0].assertionResults[0].id
    };
};

const getMutationInputs = async () => {
    const {
        populateData: {
            testPlanReport: { runnableTests, at, browser }
        }
    } = await query(gql`
        query {
            populateData(locationOfData: { testPlanRunId: 1 }) {
                testPlanReport {
                    runnableTests {
                        id
                    }
                    at {
                        id
                    }
                    browser {
                        id
                    }
                }
            }
        }
    `);

    const atVersion = await getAtVersionByQuery(
        { atId: at.id },
        undefined,
        undefined,
        { order: [['releasedAt', 'DESC']] }
    );

    const browserVersion = await getBrowserVersionByQuery({
        browserId: browser.id
    });

    const {
        testPlanRun: { empty, toBePassing, toBeDeleted }
    } = await mutate(gql`
        fragment TestResultFields on TestResult {
            id
            scenarioResults {
                id
                output
                assertionResults {
                    id
                    passed
                    failedReason
                }
                unexpectedBehaviors {
                    id
                    otherUnexpectedBehaviorText
                }
            }
        }

        mutation {
            testPlanRun(id: 1) {
                empty: findOrCreateTestResult(
                    testId: "${runnableTests[0].id}",
                    atVersionId: "${atVersion.id}",
                    browserVersionId: "${browserVersion.id}"
                ) {
                    testResult {
                        ...TestResultFields
                    }
                }
                toBePassing: findOrCreateTestResult(
                    testId: "${runnableTests[1].id}",
                    atVersionId: "${atVersion.id}",
                    browserVersionId: "${browserVersion.id}"
                ) {
                    testResult {
                        ...TestResultFields
                    }
                }
                toBeDeleted:  findOrCreateTestResult(
                    testId: "${runnableTests[2].id}",
                    atVersionId: "${atVersion.id}",
                    browserVersionId: "${browserVersion.id}"
                ) {
                    testResult {
                        id
                    }
                }
            }
        }
    `);

    const passingTestResultInput = {
        ...toBePassing.testResult,
        atVersionId: atVersion.id,
        browserVersionId: browserVersion.id,
        scenarioResults: toBePassing.testResult.scenarioResults.map(
            scenarioResult => ({
                ...scenarioResult,
                output: 'sample output',
                assertionResults: scenarioResult.assertionResults.map(
                    assertionResult => ({
                        ...assertionResult,
                        passed: true
                    })
                ),
                unexpectedBehaviors: []
            })
        )
    };

    const emptyTestResultInput = {
        atVersionId: atVersion.id,
        browserVersionId: browserVersion.id,
        ...empty.testResult
    };

    return {
        passingTestResultInput,
        emptyTestResultInput,
        testPlanRun1DeletableTestResultId: toBeDeleted.testResult.id,
        testPlanRun1TestId: runnableTests[3].id,
        atVersionId: atVersion.id,
        browserVersionId: browserVersion.id
    };
};
