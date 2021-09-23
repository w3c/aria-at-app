const assertionsResolver = (test, { priority }) => {
    if (!priority) return test.assertions;
    return test.assertions.filter(assertion => assertion.priority === priority);
};

module.exports = assertionsResolver;
