const testReferencePathResolver = testPlanVersion => {
    return testPlanVersion.metadata.testReferencePath || '';
};

module.exports = testReferencePathResolver;
