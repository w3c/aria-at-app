const gitMessageResolver = testPlanVersion => {
    return testPlanVersion.gitMessage.split('\n')[0];
};

module.exports = gitMessageResolver;
