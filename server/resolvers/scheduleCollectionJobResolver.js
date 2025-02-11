const { AuthenticationError } = require('apollo-server-core');
const {
  scheduleCollectionJob
} = require('../models/services/CollectionJobService');
const {
  getTestPlanReportById
} = require('../models/services/TestPlanReportService');
const {
  getAtVersionWithRequirements
} = require('../models/services/AtVersionService');

const scheduleCollectionJobResolver = async (
  _parent,
  { testPlanReportId },
  context
) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  const report = await getTestPlanReportById({
    id: testPlanReportId,
    transaction
  });

  if (!report) {
    throw new Error(`Test plan report with id ${testPlanReportId} not found`);
  }

  // Get the appropriate AT version for automation
  const atVersion = await getAtVersionWithRequirements(
    report.at.id,
    report.exactAtVersion,
    report.minimumAtVersion,
    transaction
  );

  return scheduleCollectionJob(
    { testPlanReportId, atVersion },
    { transaction }
  );
};

module.exports = scheduleCollectionJobResolver;
