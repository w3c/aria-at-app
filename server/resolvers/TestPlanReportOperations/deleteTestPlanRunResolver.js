const { AuthenticationError } = require('apollo-server');
const {
  getTestPlanRuns,
  removeTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const { createSimpleEvent } = require('../../models/services/EventService');
const { EVENT_TYPES } = require('../../util/eventTypes');
const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
  updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');

const deleteTestPlanRunResolver = async (
  { parentContext: { id: testPlanReportId } },
  { userId: testerUserId },
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
  const testPlanRuns = await getTestPlanRuns({
    where: { testPlanReportId, testerUserId },
    transaction
  });
  const testPlanRunId = testPlanRuns.length > 0 ? testPlanRuns[0].id : null;

  if (testPlanRunId) {
    await removeTestPlanRunById({
      id: testPlanRunId,
      transaction
    });
  }

  await createSimpleEvent({
    type: EVENT_TYPES.TESTER_REMOVAL,
    performedByUserId: user.id,
    entityId: testPlanReportId,
    metadata: {
      testerUserId,
      testPlanReportId,
      testPlanRunId
    },
    transaction
  });

  const { testPlanReport } = await populateData(
    { testPlanReportId },
    { context }
  );
  const conflicts = await conflictsResolver(testPlanReport, null, context);
  await updateTestPlanReportById({
    id: testPlanReport.id,
    values: {
      metrics: {
        ...testPlanReport.metrics,
        conflictsCount: conflicts.length
      }
    },
    transaction
  });

  return populateData({ testPlanReportId }, { context });
};

module.exports = deleteTestPlanRunResolver;
