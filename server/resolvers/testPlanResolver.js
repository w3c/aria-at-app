const { getTestPlans } = require('../models/services/TestPlanService');

const testPlanResolver = async (_, { id }, context) => {
  const { transaction } = context;

  const testPlans = await getTestPlans({
    where: { directory: id },
    includeLatestTestPlanVersion: true,
    transaction
  });
  return testPlans[0].dataValues;
};

module.exports = testPlanResolver;
