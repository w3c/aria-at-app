const draftTestPlanRunsResolver = (
    testPlanReport,
    args, // eslint-disable-line no-unused-vars
    context // eslint-disable-line no-unused-vars
) => {
    const result = testPlanReport.testPlanRuns.map(testPlanRun => {
        return {
            ...testPlanRun.dataValues,
            testPlanReport // Needed by child resolvers
        };
    });
    return result;
};

module.exports = draftTestPlanRunsResolver;
