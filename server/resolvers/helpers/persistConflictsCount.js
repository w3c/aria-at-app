const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
    updateTestPlanReport
} = require('../../models/services.deprecated/TestPlanReportService');

const persistConflictsCount = async testPlanRun => {
    const { testPlanReport: updatedTestPlanReport } = await populateData({
        testPlanRunId: testPlanRun.id
    });
    const conflicts = await conflictsResolver(updatedTestPlanReport);
    await updateTestPlanReport(updatedTestPlanReport.id, {
        metrics: {
            ...updatedTestPlanReport.metrics,
            conflictsCount: conflicts.length
        }
    });
};

module.exports = persistConflictsCount;
