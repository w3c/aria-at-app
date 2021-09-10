const { gql } = require('apollo-server');
const { difference, uniq: unique } = require('lodash');
const deepFlatFilter = require('../../util/deepFlatFilter');
const { query } = require('../util/graphql-test-utilities');

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
            'Query',
            'Mutation',
            '__Schema',
            '__Type',
            '__Field',
            '__InputValue',
            '__EnumValue',
            '__Directive'
        ];
        const excludedTypeNameAndField = [];
        ({
            typeAwareQuery,
            checkForMissingTypes,
            checkForMissingFields
        } = await getTypeAwareQuery({
            excludedTypeNames,
            excludedTypeNameAndField
        }));
    });

    it('supports every type and field in the schema', async () => {
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
                }
            `
        );
        // console.log(result)

        expect(() => {
            // const missingTypes = checkForMissingTypes();
            // if (missingTypes.length) {
            //     const typeWasOrTypesWere =
            //         missingTypes.length === 1 ? 'type was' : 'types were';
            //     const missingTypesFormatted = missingTypes
            //         .map(each => `'${each}'`)
            //         .join(', ');
            //     throw new Error(
            //         `The following ${typeWasOrTypesWere} not tested: ` +
            //             `${missingTypesFormatted}. Either add tests or ` +
            //             `explicitly exclude the types by adding the type ` +
            //             `name to the excludedTypeNames array. Note this may ` +
            //             `also occur if the query is missing the __typename ` +
            //             `field.`
            //     );
            // }

            const missingFieldsByTypeName = checkForMissingFields();
            const missingTypeName = Object.keys(missingFieldsByTypeName)[0];
            const missingFields = missingFieldsByTypeName[missingTypeName];
            if (missingTypeName) {
                const fieldOrFields =
                    missingFields.length === 1 ? 'field' : 'fields';
                const fieldsFormatted = missingFields
                    .map(each => `'${each}'`)
                    .join(', ');
                throw new Error(
                    `The '${missingTypeName}' test did not include tests for ` +
                        `the following ${fieldOrFields}: ${fieldsFormatted}. ` +
                        `Either add tests or add the typename and field to ` +
                        `excludedTypeNameAndField array. Note that null or ` +
                        `an empty array does not count!`
                );
            }
        }).not.toThrow();
    });
});
