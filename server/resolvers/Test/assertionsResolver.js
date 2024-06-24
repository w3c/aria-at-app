const assertionsResolver = (
  test,
  { priority },
  context // eslint-disable-line no-unused-vars
) => {
  if (!priority) return test.assertions;
  return test.assertions.filter(assertion => assertion.priority === priority);
};

module.exports = assertionsResolver;
