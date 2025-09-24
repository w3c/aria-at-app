const { AuthenticationError } = require('apollo-server');
const {
  createTestPlanRun,
  updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const {
  createSimpleAuditRecord
} = require('../../models/services/AuditService');
const { AUDIT_EVENT_TYPES } = require('../../util/auditEventTypes');
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

    // Create audit record for reassignment
    await createSimpleAuditRecord({
      eventType: AUDIT_EVENT_TYPES.TESTER_REASSIGNMENT,
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

    // Create audit record for new assignment
    await createSimpleAuditRecord({
      eventType: AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT,
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
