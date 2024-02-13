const {
    getTestPlanRunById
} = require('../models/services.deprecated/TestPlanRunService');

const testPlanRunResolver = async (_, { id }) => {
    return getTestPlanRunById(id);
};

module.exports = testPlanRunResolver;
