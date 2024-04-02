const runnableTestsLengthResolver = async (
    testPlanReport,
    args, // eslint-disable-line no-unused-vars
    context // eslint-disable-line no-unused-vars
) => {
    // Custom column added with sequelize.literal provides an array as such
    // runnableTestsCount: [ x, y, z ] where x=jawsCount, y=nvdaCount, z=voCount
    return testPlanReport.testPlanVersion.dataValues.runnableTestsCount[
        testPlanReport.atId - 1
    ];
};

module.exports = runnableTestsLengthResolver;
