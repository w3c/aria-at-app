const testPlanVersionTestPlanResolver = testPlanVersion => {
    return {
        id: testPlanVersion.directory,
        directory: testPlanVersion.directory
    };
};

module.exports = testPlanVersionTestPlanResolver;
