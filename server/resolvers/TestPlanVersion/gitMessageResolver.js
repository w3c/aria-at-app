const gitMessageResolver = parent => {
    return parent.gitMessage.split('\n')[0];
};

module.exports = gitMessageResolver;
