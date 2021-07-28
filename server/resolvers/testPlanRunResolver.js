const { getTestPlanRunById } = require('../models/services/TestPlanRunService');

const testPlanRunResolver = async (_, { id }) => {
    const result = await getTestPlanRunById(id);

    // TODO: Revise
    if (!result) return null;
    let { testResults: results } = result;
    if (!results) results = [];

    const testResults = results.map(each => ({
        ...each.test,
        ...each
    }));

    return {
        ...result,
        testResults
    };
};

module.exports = testPlanRunResolver;
