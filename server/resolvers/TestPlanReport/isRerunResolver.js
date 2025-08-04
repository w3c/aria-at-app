const isRerunResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context // eslint-disable-line no-unused-vars
) => {
  return !!testPlanReport.historicalReportId;
};

module.exports = isRerunResolver;
