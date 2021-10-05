const draftTestPlanRunsResolver = testPlanReport => {
    const result = testPlanReport.testPlanRuns.map(testPlanRun => {
        return {
            ...testPlanRun.dataValues,
            testPlanReport // Needed by child resolvers
        };
    });
    return result;
};

module.exports = draftTestPlanRunsResolver;
