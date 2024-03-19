const {
  getTestResults
} = require('../../models/services/TestResultReadService');

const testResultsResolver = async (testPlanRun, _, context) => {
  const { transaction } = context;

  return getTestResults(testPlanRun, { transaction });
};

module.exports = testResultsResolver;
