const {
    getTestPlanVersions
} = require('../models/services/TestPlanVersionService');

const testPlanVersionsResolver = async () => {
    return getTestPlanVersions();
};

module.exports = testPlanVersionsResolver;
