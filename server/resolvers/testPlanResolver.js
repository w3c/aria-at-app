const { getTestPlans } = require('../models/services/TestPlanService');

const testPlanResolver = async (_, { id }, context) => {
    const { t } = context;

    const testPlans = await getTestPlans({
        where: { directory: id },
        includeLatestTestPlanVersion: true,
        t
    });
    return testPlans[0].dataValues;
};

module.exports = testPlanResolver;
