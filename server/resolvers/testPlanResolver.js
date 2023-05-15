const { getTestPlans } = require('../models/services/TestPlanService');

const testPlanResolver = async (_, { id }) => {
    const testPlans = await getTestPlans({ directory: id }, true);
    return testPlans[0].dataValues;
};

module.exports = testPlanResolver;
