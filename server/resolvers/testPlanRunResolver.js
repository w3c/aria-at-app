const { getTestPlanRunById } = require('../models/services/TestPlanRunService');

const testPlanRunResolver = async (_, { id }) => {
    const result = await getTestPlanRunById(id);

    if (!result) return null;

    const testResults = result.testResults.map(each => ({
        ...each.test,
        ...each
    }));

    return {
        ...result,
        testResults
    };
};

module.exports = testPlanRunResolver;
