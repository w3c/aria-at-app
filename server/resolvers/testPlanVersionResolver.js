const {
    getTestPlanVersionById
} = require('../models/services/TestPlanVersionService');

const testPlanVersionResolver = async (_, { id }) => {
    return getTestPlanVersionById(id);
};

module.exports = testPlanVersionResolver;
