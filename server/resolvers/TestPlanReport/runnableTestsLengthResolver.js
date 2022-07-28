const runnableTestsLengthResolver = async testPlanReport => {
    // Custom column added with sequelize.literal provides an array as such
    // runnableTestsCount: [ x, y, z] where x=jawsCount, y=nvdaCount, z=voCount
    return testPlanReport.testPlanVersion.dataValues.runnableTestsCount[
        testPlanReport.atId - 1
    ];
};

module.exports = runnableTestsLengthResolver;
