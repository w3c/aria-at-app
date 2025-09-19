const { AuthenticationError } = require('apollo-server-core');
const {
  scheduleCollectionJob
} = require('../models/services/CollectionJobService');

const scheduleCollectionJobResolver = async (
  _,
  { testPlanReportId },
  context
) => {
  const { user, transaction } = context;

  if (
    !user?.roles.find(role => role.name === 'ADMIN' || role.name === 'TESTER')
  ) {
    throw new AuthenticationError();
  }

  return scheduleCollectionJob({ testPlanReportId }, { transaction });
};

module.exports = scheduleCollectionJobResolver;
