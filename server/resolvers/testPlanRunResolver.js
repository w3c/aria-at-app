const { getTestPlanRunById } = require('../models/services/TestPlanRunService');

const testPlanRunResolver = async (_, { id }) => {
    return getTestPlanRunById(id);
};

module.exports = testPlanRunResolver;
