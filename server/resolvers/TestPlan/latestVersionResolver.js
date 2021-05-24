const latestVersionResolver = parent => {
    return {
        ...parent.dataValues,
        gitSha: parent.sourceGitCommitHash,
        gitMessage: parent.sourceGitCommitMessage.split('\n')[0],
        tests: parent.parsed.tests.map((_, index) => `test ${index}`)
    };
};

module.exports = latestVersionResolver;
