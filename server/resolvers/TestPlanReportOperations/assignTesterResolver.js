const { AuthenticationError } = require('apollo-server');
const {
  createTestPlanRun,
  updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const assignTesterResolver = async (
  { parentContext: { id: testPlanReportId } },
  { userId: testerUserId, testPlanRunId },
  context
) => {
  const { user, transaction } = context;

  if (
    !(
      user?.roles.find(role => role.name === 'ADMIN') ||
      (user?.roles.find(role => role.name === 'TESTER') &&
        testerUserId == user.id)
    )
  ) {
    throw new AuthenticationError();
  }
  // If testPlanRunId is provided reassign the tester to the testPlanRun
  if (testPlanRunId) {
    await updateTestPlanRunById({
      id: testPlanRunId,
      values: { testerUserId },
      transaction
    });
  } else {
    const { id } = await createTestPlanRun({
      values: { testPlanReportId, testerUserId },
      transaction
    });
    testPlanRunId = id;
  }

  return populateData({ testPlanRunId }, { transaction });
};

module.exports = assignTesterResolver;
