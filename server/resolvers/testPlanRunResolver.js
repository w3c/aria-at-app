const { getTestPlanRunById } = require('../models/services/TestPlanRunService');

const testPlanRunResolver = async (_, { id }, context) => {
    const { t } = context;

    return getTestPlanRunById({ id, t });
};

module.exports = testPlanRunResolver;
