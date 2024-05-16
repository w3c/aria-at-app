// eslint-disable-next-line no-unused-vars
const testStatusResolver = (collectionJob, _, context) => {
    // resolve testStatus.test for each test
    // testPlanRun "might" be null if the testPlanRun had been deleted
    const testPlanTests =
        collectionJob.testPlanRun?.testPlanReport.testPlanVersion.tests ?? [];
    const tests = new Map(testPlanTests.map(test => [test.id, test]));

    return collectionJob.testStatus.map(status => ({
        ...status.dataValues,
        // if not found, at least return the test id
        test: tests.get(status.testId) ?? { id: status.testId }
    }));
};
module.exports = testStatusResolver;
