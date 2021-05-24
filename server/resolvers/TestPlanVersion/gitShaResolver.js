const gitShaResolver = parent => {
    return parent.sourceGitCommitHash;
};

module.exports = gitShaResolver;
