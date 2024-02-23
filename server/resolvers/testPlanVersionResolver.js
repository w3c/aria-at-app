const {
    getTestPlanVersionById
} = require('../models/services/TestPlanVersionService');

const testPlanVersionResolver = async (_, { id }, context) => {
    const { t } = context;

    return getTestPlanVersionById({ id, t });
};

module.exports = testPlanVersionResolver;
