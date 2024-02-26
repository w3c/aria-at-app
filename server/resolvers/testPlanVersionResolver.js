const {
    getTestPlanVersionById
} = require('../models/services/TestPlanVersionService');

const testPlanVersionResolver = async (_, { id }, context) => {
    const { transaction } = context;

    return getTestPlanVersionById({ id, transaction });
};

module.exports = testPlanVersionResolver;
