const { AuthenticationError } = require('apollo-server');
const {
  getTestPlanReportById,
  updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const populateData = require('../../services/PopulatedData/populateData');

const setOnHoldResolver = async (
  { parentContext: { id: testPlanReportId } },
  { onHold },
  context
) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  // Ensure report exists
  await getTestPlanReportById({ id: testPlanReportId, transaction });

  await updateTestPlanReportById({
    id: testPlanReportId,
    values: { onHold },
    transaction
  });

  return populateData({ testPlanReportId }, { context });
};

module.exports = setOnHoldResolver;
