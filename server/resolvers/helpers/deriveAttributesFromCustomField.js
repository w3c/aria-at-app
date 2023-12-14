const mapParentFn = field => {
    if (field.subfields) {
        return [
            ...field.subfields.flatMap(subfield =>
                mapSubfieldFn(field.value, subfield)
            ),
            field.value
        ];
    }
    return field.value;
};

const mapSubfieldFn = (parent, field) => {
    if (field.subfields) {
        return [
            ...field.subfields.flatMap(subfield =>
                mapSubfieldFn(field.value, subfield)
            ),
            `${parent}.${field.value}`
        ];
    }
    return `${parent}.${field.value}`;
};

const getChildPaths = (parent, fields) => {
    return fields.map(item => {
        if (item.includes(`${parent}.`)) return item.replace(`${parent}.`, '');
        return item;
    });
};

/**
 * Returns the required database attributes to be called to support GraphQL field(s) being called
 * @param {string} fieldName - The referenced field name defined in graphql-schema
 * @param {string[]} customFields - Gathered graphql query field names to check if there is a matching database attribute
 * @returns {{fields: *[], derived: *[]}|*[]}
 */
const deriveAttributesFromCustomField = (fieldName, customFields) => {
    if (!customFields) return [];
    const derived = [];
    const fields = [
        ...customFields.map(({ value }) => value),
        ...customFields.flatMap(mapParentFn)
    ];
    fields.push(...getChildPaths(fieldName, fields));

    switch (fieldName) {
        case 'testPlanVersion':
        case 'latestTestPlanVersion': {
            if (
                fields.includes('testPlan.id') ||
                fields.includes('testPlan.directory')
            )
                derived.push('directory');
            break;
        }
        case 'testPlanReport': {
            if (fields.includes('at')) derived.push('atId');
            if (fields.includes('browser')) derived.push('browserId');
            if (fields.includes('testPlanVersion'))
                derived.push('testPlanVersionId');
            if (fields.includes('isFinal')) derived.push('markedFinalAt');
            break;
        }
        case 'draftTestPlanRuns': {
            if (fields.includes('tester')) derived.push('testerUserId');
            if (fields.includes('testPlanReport'))
                derived.push('testPlanReportId');
        }
    }

    return { fields, derived };
};

module.exports = deriveAttributesFromCustomField;
