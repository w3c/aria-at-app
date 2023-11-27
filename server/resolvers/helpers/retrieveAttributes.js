const deriveAttributesFromCustomField = require('./deriveAttributesFromCustomField');

const getAttributesFromSelections = (
    selections,
    fieldName = null,
    useSubpath = false
) => {
    return (
        useSubpath
            ? selections.filter(item => item.name.value === fieldName)
            : selections
    ).map(({ name: { value }, selectionSet }) => {
        return {
            value,
            // Most selections with an extra selectionSet is a custom attribute
            subfields: selectionSet
                ? getAttributesFromSelections(selectionSet.selections)
                : null
        };
    });
};

/**
 * Used to return the ONLY database attributes a query may require to process a graphql query
 * @param {string} fieldName - The referenced field name defined in graphql-schema. eg. testPlanReport, testPlanVersion,
 *        draftTestPlanRuns
 * @param {string[]} modelAttributes - The 'known' database attributes the field could include
 * @param {Array<FieldNode>} fieldNodes - Apollo GraphQL's fieldNodes included in a query's info object
 *        {see https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments}
 * @param {boolean} useSubpath - Flag to check attributes at increased depths of the query object
 * @returns {{raw: *[], attributes: any[]}}
 */
const retrieveAttributes = (
    fieldName,
    modelAttributes,
    { fieldNodes },
    useSubpath = false
) => {
    const attributes = getAttributesFromSelections(
        fieldNodes[0].selectionSet.selections,
        fieldName,
        useSubpath
    );

    // Filter the attributes from field nodes against the model columns
    const found = [];

    // Could be custom fields that need to be handled separately in resolver
    const unknown = [];

    attributes.forEach(attribute => {
        if (modelAttributes.includes(attribute.value)) found.push(attribute);
        else unknown.push(attribute);
    });

    const { fields, derived } = deriveAttributesFromCustomField(
        fieldName,
        unknown
    );

    fields.forEach(field => {
        if (modelAttributes.includes(field)) found.push({ value: field });
    });

    // filter out duplicates
    return {
        raw: [...new Set(fields)],
        attributes: [...new Set([...found.map(item => item.value), ...derived])]
    };
};

module.exports = retrieveAttributes;
