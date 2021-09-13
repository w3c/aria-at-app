const finalizedTestPlanRunResolver = testPlanReport => {
    if (
        testPlanReport.status !== 'FINALIZED' ||
        !testPlanReport.testPlanRuns.length
    ) {
        return null;
    }
    return {
        ...testPlanReport.testPlanRuns.dataValues,
        tester: null, // Finalized runs represent the work of all testers
        testers: testPlanReport.testPlanRuns.map(each => each.tester),
        testPlanReport // Needed by child resolvers
    };
};

module.exports = finalizedTestPlanRunResolver;
