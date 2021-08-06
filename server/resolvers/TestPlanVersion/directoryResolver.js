const directoryResolver = testPlanVersion => {
    return testPlanVersion.metadata.directory || '';
};

module.exports = directoryResolver;
