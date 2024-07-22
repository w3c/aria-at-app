const testResultsLengthResolver = async (
  testPlanRun,
  args, // eslint-disable-line no-unused-vars
  context // eslint-disable-line no-unused-vars
) => {
  return testPlanRun.testResultsLength;
};

module.exports = testResultsLengthResolver;
