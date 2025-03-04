const { AuthenticationError } = require('apollo-server-core');
const {
  scheduleCollectionJob
} = require('../models/services/CollectionJobService');
const {
  getAtVersionWithRequirements
} = require('../models/services/AtVersionService');
const {
  getTestPlanReportById
} = require('../models/services/TestPlanReportService');

const scheduleCollectionJobResolver = async (
  _parent,
  { testPlanReportId },
  context
) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  const testPlanReport = await getTestPlanReportById({
    id: testPlanReportId,
    transaction
  });

  const atVersion = await getAtVersionWithRequirements(
    testPlanReport.at.id,
    testPlanReport.exactAtVersion,
    testPlanReport.minimumAtVersion,
    transaction
  );

  return scheduleCollectionJob(
    { testPlanReportId, atVersion },
    { transaction }
  );
};

module.exports = scheduleCollectionJobResolver;
