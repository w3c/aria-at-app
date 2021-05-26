const {
    getTestPlanVersionById,
} = require('../models/services/TestPlanVersionService');

// TODO: Revisit when the versioning approach is more defined
const testPlans = async () => {
    const testPlan = await getTestPlanVersionById(1);
    return [{ latestVersion: testPlan }];
};

module.exports = testPlans;
