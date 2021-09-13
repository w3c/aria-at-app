const { gql } = require('apollo-server');
const { difference, uniq: unique } = require('lodash');
const deepFlatFilter = require('../../util/deepFlatFilter');
const { query } = require('../util/graphql-test-utilities');
const db = require('../../models/index');

/**
 * Get a function for making GraphQL queries - as well as functions to check whether any types or any fields were not queried. Note, for this to work, all queried types must include the __typename property.
 * @param {object} options
 * @param {string[]} options.excludedTypeNames - Array with a string for the type names which should not count as missing.
 * @param {array} options.excludedTypeNameAndField - Array of arrays with a string for the type name and a string for the field name which should not count as missing.
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

    const typeAwareQuery = async (...args) => {
        const result = await query(...args);
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
        return result;
    };

    const checkForMissingTypes = () => {
        const missingTypes = [];
        Object.keys(graphqlFieldsByType).forEach(typeName => {
            if (
                !graphqlQueriedFieldsByType[typeName] &&
                !excludedTypeNames.includes(typeName)
            ) {
                missingTypes.push(typeName);
            }
        });
        return missingTypes;
    };

    const checkForMissingFields = () => {
        const missingFieldsByType = {};
        Object.entries(graphqlFieldsByType).forEach(([typeName, fields]) => {
            if (excludedTypeNames.includes(typeName)) return;

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

    return { typeAwareQuery, checkForMissingTypes, checkForMissingFields };
};

let typeAwareQuery, checkForMissingTypes, checkForMissingFields;

describe('graphql', () => {
    beforeAll(async () => {
        const excludedTypeNames = [
            '__Schema',
            '__Type',
            '__Field',
            '__InputValue',
            '__EnumValue',
            '__Directive',
            'Query',
            'Mutation',
            // TODO: Add a typeAwareMutation as well
            'TestPlanReportOperations',
            'TestPlanRunOperations',
            'TestResultOperations',
            'FindOrCreateResult'
        ];
        const excludedTypeNameAndField = [
            // TODO: Implement as part of frontend changes
            ['TestResult', 'startedAt'],
            ['TestResult', 'completedAt']
        ];
        ({
            typeAwareQuery,
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
        const assertionResultId =
            'Njc3OeyIxNCI6IlltSXpOZXlJeE15STZJbHBxYXpWWlpYbEplRTFwU1RaTldEQlh' +
            'WbXRaZWlKOURJd09UIn0DUxNz';

        // eslint-disable-next-line no-unused-vars
        const result = await typeAwareQuery(
            gql`
                query {
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
                            exampleUrl
                            metadata
                            tests {
                                __typename
                                id
                                title
                                ats {
                                    id
                                }
                                atMode
                                startupScriptContent
                                instructions
                                scenarios {
                                    __typename
                                    id
                                    at {
                                        id
                                    }
                                    command {
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
                    conflictTestPlanReport: testPlanReport(id: 2) {
                        __typename
                        id
                        status
                        createdAt
                        testPlanVersion {
                            id
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
                    finalTestPlanReport: testPlanReport(id: 3) {
                        __typename
                        finalizedTestPlanRun {
                            __typename
                            testers {
                                username
                            }
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
        // console.log(result);

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
                        `field.`
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
