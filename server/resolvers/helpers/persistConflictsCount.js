const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
  updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');

const persistConflictsCount = async (testPlanRun, context) => {
  const { transaction } = context;

  const { testPlanReport: updatedTestPlanReport } = await populateData(
    { testPlanRunId: testPlanRun.id },
    { context }
  );
  const conflicts = await conflictsResolver(
    updatedTestPlanReport,
    null,
    context
  );
  await updateTestPlanReportById({
    id: updatedTestPlanReport.id,
    values: {
      metrics: {
        ...updatedTestPlanReport.metrics,
        conflictsCount: conflicts.length
      }
    },
    transaction
  });
};

module.exports = persistConflictsCount;
