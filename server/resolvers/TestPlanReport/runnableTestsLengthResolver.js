const runnableTestsLengthResolver = async testPlanReport => {
    return testPlanReport.testPlanVersion.dataValues.runnableTestsCount[
        testPlanReport.atId - 1
    ];
};

module.exports = runnableTestsLengthResolver;
