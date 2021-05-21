const { getTestPlanById } = require('../models/services/TestPlanService');

const testPlans = async () => {
    const testPlan = await getTestPlanById(1);
    return [testPlan];
};

module.exports = testPlans;
