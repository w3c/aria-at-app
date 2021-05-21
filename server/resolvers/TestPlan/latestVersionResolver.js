const latestVersionResolver = parent => {
    return {
        ...parent.dataValues,
        gitSha: parent.dataValues.sourceGitCommitHash,
        gitMessage: parent.dataValues.sourceGitCommitMessage.split('\n')[0],
        testCount: parent.dataValues.parsed.tests.length
    };
};

module.exports = latestVersionResolver;
