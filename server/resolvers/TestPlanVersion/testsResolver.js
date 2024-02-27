const getTests = require('../../models/services/TestsService');

/**
 * Resolves the Tests from their reduced form in the database to a fully-
 * populated form. Must be called before returning any test in GraphQL.
 * @param {*} parentRecord - Can be a TestPlanVersion or a TestPlanReport. Using
 * a TestPlanReport is preferable because it allows the resolver to infer a
 * default atId for child fields as in the `renderableContent(atId: ID)` field.
 * @returns {array[*]} - An array of resolved tests.
 */
const testsResolver = (
    parentRecord,
    args, // eslint-disable-line no-unused-vars
    context // eslint-disable-line no-unused-vars
) => getTests(parentRecord);

module.exports = testsResolver;
