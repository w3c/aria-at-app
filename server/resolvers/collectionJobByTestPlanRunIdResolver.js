const {
  getCollectionJobs
} = require('../models/services/CollectionJobService');

const collectionJobByTestPlanRunIdResolver = async (
  _,
  { testPlanRunId },
  context
) => {
  const { transaction } = context;

  const collectionJobs = await getCollectionJobs({
    where: { testPlanRunId },
    transaction
  });
  if (!collectionJobs || collectionJobs.length === 0) {
    return null;
  } else if (collectionJobs.length > 1) {
    throw new Error(
      `Multiple collection jobs found for test plan run id ${testPlanRunId}`
    );
  }

  return collectionJobs[0];
};

module.exports = collectionJobByTestPlanRunIdResolver;
