const conflictsResolver = testPlanReport => {
    if (testPlanReport.testPlanRuns.length <= 1) return [];
    throw new Error('Not fully implemented');
};

module.exports = conflictsResolver;
