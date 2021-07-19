const {
    getTestPlanVersionById
} = require('../models/services/TestPlanVersionService');

// TODO: Revisit when the versioning approach is more defined
const testPlans = async () => {
    const testPlanVersion = await getTestPlanVersionById(1);
    return [{ latestTestPlanVersion: testPlanVersion }];
};

module.exports = testPlans;
