const { getTestPlans } = require('../models/services/TestPlanService');
const staleWhileRevalidate = require('../util/staleWhileRevalidate');
const {
  TEST_PLAN_ATTRIBUTES,
  TEST_PLAN_VERSION_ATTRIBUTES
} = require('../models/services/helpers');

const testPlansUncached = async (_, { testPlanVersionPhases }, context) => {
  const { transaction } = context;

  const plans = await getTestPlans({
    includeLatestTestPlanVersion: true,
    testPlanAttributes: TEST_PLAN_ATTRIBUTES,
    testPlanVersionAttributes: TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes: [],
    atAttributes: [],
    browserAttributes: [],
    testPlanRunAttributes: [],
    userAttributes: [],
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

const testPlans = staleWhileRevalidate(testPlansUncached, {
  getCacheKeyFromArguments: (_, { testPlanVersionPhases }) =>
    JSON.stringify(testPlanVersionPhases),
  millisecondsUntilStale: 30000
});

module.exports = testPlans;
