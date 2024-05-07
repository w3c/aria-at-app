const { getTestPlans } = require('../models/services/TestPlanService');

const testPlanResolver = async (_, { id }, context) => {
    // console.log(1)
    const { transaction } = context;
    // console.log(2)
    const testPlans = await getTestPlans({
        where: { directory: id },
        includeLatestTestPlanVersion: true,
        transaction
    });
    // console.log(3)
    // console.log("testPlan Value", testPlans[0].dataValues)
    return testPlans[0]?.dataValues;
};

module.exports = testPlanResolver;
