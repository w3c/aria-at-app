const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');

const persistConflictsCount = async (testPlanRun, context) => {
    const { testPlanReport: updatedTestPlanReport } = await populateData(
        {
            testPlanRunId: testPlanRun.id
        },
        { context }
    );
    const conflicts = await conflictsResolver(
        updatedTestPlanReport,
        null,
        context
    );
    await updateTestPlanReport(updatedTestPlanReport.id, {
        metrics: {
            ...updatedTestPlanReport.metrics,
            conflictsCount: conflicts.length
        }
    });
};

module.exports = persistConflictsCount;
