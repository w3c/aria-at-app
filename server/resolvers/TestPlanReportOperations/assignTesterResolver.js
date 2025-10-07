const { AuthenticationError } = require('apollo-server');
const {
  createTestPlanRun,
  updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const { createSimpleEvent } = require('../../models/services/EventService');
const { EVENT_TYPES } = require('../../util/eventTypes');
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
    const currentTestPlanRun = await populateData(
      { testPlanRunId },
      { context }
    );
    const fromTesterUserId = currentTestPlanRun.testPlanRun.testerUserId;

    await updateTestPlanRunById({
      id: testPlanRunId,
      values: { testerUserId },
      transaction
    });

    // Create event log about reassignment
    await createSimpleEvent({
      type: EVENT_TYPES.TESTER_REASSIGNMENT,
      performedByUserId: user.id,
      entityId: testPlanReportId,
      metadata: {
        fromTesterUserId,
        toTesterUserId: testerUserId,
        testPlanReportId,
        testPlanRunId
      },
      transaction
    });
  } else {
    const { id } = await createTestPlanRun({
      values: { testPlanReportId, testerUserId },
      transaction
    });
    testPlanRunId = id;

    // Create event log about new assignment
    await createSimpleEvent({
      type: EVENT_TYPES.TESTER_ASSIGNMENT,
      performedByUserId: user.id,
      entityId: testPlanReportId,
      metadata: {
        testerUserId,
        testPlanReportId,
        testPlanRunId
      },
      transaction
    });
  }

  return populateData({ testPlanRunId }, { context });
};

module.exports = assignTesterResolver;
