const findTestPlanReportConflicts = (testPlanReport) => {
    if (testPlanReport.testPlanRuns.length <= 1) return [];
    throw new Error('Not fully implemented');
};

module.exports = findTestPlanReportConflicts;
