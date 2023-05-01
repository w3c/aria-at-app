const { getTestPlans } = require('../models/services/TestPlanService');

const testPlans = async () => {
    const plans = await getTestPlans();
    return plans.map(p => {
        return { ...p.dataValues };
    });
};

module.exports = testPlans;
