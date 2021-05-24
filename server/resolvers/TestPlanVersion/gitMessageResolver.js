const gitMessageResolver = parent => {
    return parent.sourceGitCommitMessage.split('\n')[0];
};

module.exports = gitMessageResolver;
