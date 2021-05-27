const testCountResolver = testPlanVersion => {
    return testPlanVersion.tests.length;
};

module.exports = testCountResolver;
