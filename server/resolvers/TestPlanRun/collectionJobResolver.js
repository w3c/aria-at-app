const collectionJobByTestPlanRunIdResolver = require('../collectionJobByTestPlanRunIdResolver');

const collectionJobResolver = async (
  testPlanRun,
  args, // eslint-disable-line no-unused-vars
  context // eslint-disable-line no-unused-vars
) => {
  const collectionJob = await collectionJobByTestPlanRunIdResolver(
    null,
    { testPlanRunId: testPlanRun.id },
    context
  );
  if (collectionJob) {
    return { ...collectionJob.dataValues, __testPlanRunChild: true };
  }
  return collectionJob;
};

module.exports = collectionJobResolver;
