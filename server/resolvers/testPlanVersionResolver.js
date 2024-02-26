const {
    getTestPlanVersionById
} = require('../models/services.deprecated/TestPlanVersionService');

const testPlanVersionResolver = async (_, { id }) => {
    return getTestPlanVersionById(id);
};

module.exports = testPlanVersionResolver;
