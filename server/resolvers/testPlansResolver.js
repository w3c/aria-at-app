const { getTestPlans } = require('../models/services/TestPlanService');

const testPlans = async (_, { testPlanVersionPhases }, context) => {
  const { transaction } = context;

  const plans = await getTestPlans({
    includeLatestTestPlanVersion: true,
    pagination: { order: [['testPlanVersions', 'updatedAt', 'DESC']] },
    transaction
  });

  return plans.map(p => {
    return {
      ...p.dataValues,
      testPlanVersions: p.testPlanVersions?.filter(testPlanVersion => {
        if (!testPlanVersionPhases) return true;
        return testPlanVersionPhases.includes(testPlanVersion.phase);
      })
    };
  });
};

module.exports = testPlans;
