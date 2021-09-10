const { gql } = require('apollo-server');
const { difference } = require('lodash');
const deepFlatFilter = require('../../util/deepFlatFilter');
const { query } = require('../util/graphql-test-utilities');

/**
 * Get a function for making GraphQL queries - as well as functions to check whether any types or any fields were not queried. Note, for this to work, all types must include the __typename property.
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
            graphqlFieldsByType[graphqlType.name] = graphqlType.fields;
        }
    });

    const typeAwareQuery = (...args) => {
        const result = query(...args);
        const fields = deepFlatFilter(result, part => !!part?.__typename);
        graphqlQueriedFieldsByType[fields.__typename] = {
            ...(graphqlQueriedFieldsByType[fields.__typename] || {}),
            ...Object.keys(fields)
        };
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
            if (!excludedTypeNames.includes(typeName)) return;

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
        const excludedTypeNames = [];
        const excludedTypeNameAndField = [];
        ({
            typeAwareQuery,
            checkForMissingTypes,
            checkForMissingFields
        } = await getTypeAwareQuery());
    });

    it('has tests for every graphql type', () => {});
});
