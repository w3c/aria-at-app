const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
    updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');

const persistConflictsCount = async (testPlanRun, { t }) => {
    const { testPlanReport: updatedTestPlanReport } = await populateData({
        testPlanRunId: testPlanRun.id
    });
    const conflicts = await conflictsResolver(updatedTestPlanReport);
    await updateTestPlanReportById({
        id: updatedTestPlanReport.id,
        values: {
            metrics: {
                ...updatedTestPlanReport.metrics,
                conflictsCount: conflicts.length
            }
        },
        t
    });
};

module.exports = persistConflictsCount;
