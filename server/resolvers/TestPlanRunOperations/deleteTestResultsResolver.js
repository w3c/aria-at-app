const { AuthenticationError } = require('apollo-server');
const {
  updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const persistConflictsCount = require('../helpers/persistConflictsCount');

const deleteTestResultsResolver = async (
  { parentContext: { id: testPlanRunId } },
  _,
  context
) => {
  const { user, transaction } = context;

  const { testPlanRun } = await populateData(
    { testPlanRunId },
    { transaction }
  );

  if (
    !(
      user?.roles.find(role => role.name === 'ADMIN') ||
      (user?.roles.find(role => role.name === 'TESTER') &&
        testPlanRun.testerUserId == user.id)
    )
  ) {
    throw new AuthenticationError();
  }

  await updateTestPlanRunById({
    id: testPlanRunId,
    values: { testResults: [] },
    transaction
  });

  // TODO: Avoid blocking loads in test runs with a larger amount of tests
  //       and/or test results
  await persistConflictsCount(testPlanRun, context);
  return populateData({ testPlanRunId }, { transaction });
};

module.exports = deleteTestResultsResolver;
