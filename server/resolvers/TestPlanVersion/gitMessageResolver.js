const gitMessageResolver = (
  testPlanVersion,
  args, // eslint-disable-line no-unused-vars
  context // eslint-disable-line no-unused-vars
) => {
  return testPlanVersion.gitMessage.split('\n')[0];
};

module.exports = gitMessageResolver;
