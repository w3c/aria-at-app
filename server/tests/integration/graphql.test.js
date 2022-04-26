const { gql } = require('apollo-server');
const { difference, uniq: unique } = require('lodash');
const deepFlatFilter = require('../../util/deepFlatFilter');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models/index');
const dbCleaner = require('../util/db-cleaner');

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
        ];
        const excludedTypeNameAndField = [
            // Items formatted like this:
            // ['TestResult', 'startedAt'],
            ['AtVersion', 'availability'] // excluding because some entries will be null
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
                        browserVersions
                    }
                    ats {
                        __typename
                        id
                        name
                        atVersions
                    }
                    atVersion(atId: 1, atVersion: "2021.2103.174"){
                        __typename
                        atId
                        atVersion
                        availability
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
                    }
                    testPlanVersions {
                        id
                    }
                    testPlanVersion(id: 1) {
                        __typename
                        id
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
                        testPlanVersion {
                            id
                        }
                        runnableTests {
                            __typename
                            id
                            renderableContent
                            renderedUrl
                        }
                        testPlanTarget {
                            __typename
                            id
                            title
                            at {
                                id
                            }
                            atVersion
                            browser {
                                id
                            }
                            browserVersion
                        }
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
                    }
                    testPlanReport(id: 3) {
                        __typename
                        finalizedTestResults {
                            __typename
                            id
                            startedAt
                            completedAt
                        }
                    }
                    testPlanReports {
                        id
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
                        testPlanRun {
                            id
                        }
                        testPlanTarget {
                            id
                        }
                        at {
                            id
                        }
                        browser {
                            id
                        }
                        atVersion
                        browserVersion
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
                testPlanRun1TestId
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
                    ) {
                        __typename
                        findOrCreateTestPlanReport(
                            input: {
                                testPlanVersionId: 2
                                testPlanTarget: {
                                    atId: 2
                                    browserId: 2
                                    atVersion: "123"
                                    browserVersion: "123"
                                }
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
                            updateStatus(status: IN_REVIEW) {
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
                        testPlanRun(id: 1) {
                            __typename
                            findOrCreateTestResult(
                                testId: $testPlanRun1TestId
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
                        atVersion(id: 2) {
                            __typename
                            findOrCreateAtVersion(atVersion: "2021.2103.174") {
                                atId
                                atVersion
                                availability
                            }
                            editAtVersion(
                                atVersion: "2021.2103.174"
                                updateParams: { availability: "1/1/2023" }
                            ) {
                                atId
                                atVersion
                                availability
                            }
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
                        testPlanRun1TestId
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
            testPlanReport: { runnableTests }
        }
    } = await query(gql`
        query {
            populateData(locationOfData: { testPlanRunId: 1 }) {
                testPlanReport {
                    runnableTests {
                        id
                    }
                }
            }
        }
    `);

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
                empty: findOrCreateTestResult(testId: "${runnableTests[0].id}") {
                    testResult {
                        ...TestResultFields
                    }
                }
                toBePassing: findOrCreateTestResult(testId: "${runnableTests[1].id}") {
                    testResult {
                        ...TestResultFields
                    }
                }
                toBeDeleted:  findOrCreateTestResult(testId: "${runnableTests[2].id}") {
                    testResult {
                        id
                    }
                }
            }
        }
    `);

    const passingTestResultInput = {
        ...toBePassing.testResult,
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

    return {
        passingTestResultInput,
        emptyTestResultInput: empty.testResult,
        testPlanRun1DeletableTestResultId: toBeDeleted.testResult.id,
        testPlanRun1TestId: runnableTests[3].id
    };
};
