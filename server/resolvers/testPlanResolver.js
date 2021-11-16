const {
    getTestPlanById
} = require('../models/services/TestPlanVersionService');

const testPlanResolver = async (_, { id }) => {
    return getTestPlanById(id);
};

module.exports = testPlanResolver;
