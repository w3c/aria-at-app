const {
  getEventsForTestPlanReport
} = require('../../models/services/EventService');

const updateEventsResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context
) => {
  const { transaction } = context;

  return await getEventsForTestPlanReport({
    testPlanReportId: testPlanReport.id,
    pagination: {
      order: [['timestamp', 'DESC']]
    },
    transaction
  });
};

module.exports = updateEventsResolver;
