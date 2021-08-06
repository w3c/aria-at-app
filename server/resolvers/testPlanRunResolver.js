const { getTestPlanRunById } = require('../models/services/TestPlanRunService');

const testPlanRunResolver = async (_, { id }) => {
    const result = await getTestPlanRunById(id);

    if (!result) return null;
    return result;
};

module.exports = testPlanRunResolver;
