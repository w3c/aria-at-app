const runnableTestsLengthResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context // eslint-disable-line no-unused-vars
) => {
  // Custom column added with sequelize.literal provides an array as such
  // runnableTestsCount: [ a, b, c, d ] where a=jawsCount, b=nvdaCount, c=voCount, d=talkbackCount
  return (
    testPlanReport.testPlanVersion.dataValues.runnableTestsCount[
      testPlanReport.atId - 1
    ] || 0
  );
};

module.exports = runnableTestsLengthResolver;
