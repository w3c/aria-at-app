const deriveAttributesFromCustomField = require('./deriveAttributesFromCustomField');

const getAttributesFromSelections = (
    selections,
    modelName = null,
    useSubpath = false
) => {
    return (
        useSubpath
            ? selections.filter(item => item.name.value === modelName)
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

const retrieveAttributes = (
    modelName,
    modelAttributes,
    { fieldNodes },
    useSubpath = false
) => {
    const attributes = getAttributesFromSelections(
        fieldNodes[0].selectionSet.selections,
        modelName,
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
        modelName,
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
