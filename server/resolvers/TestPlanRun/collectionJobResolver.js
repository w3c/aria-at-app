const DataLoader = require('dataloader');
const {
  getCollectionJobs
} = require('../../models/services/CollectionJobService');
const {
  COLLECTION_JOB_ATTRIBUTES,
  COLLECTION_JOB_TEST_STATUS_ATTRIBUTES
} = require('../../models/services/helpers');

const createCollectionJobBatchLoader = context => {
  return new DataLoader(async testPlanRunIds => {
    const collectionJobs = await getCollectionJobs({
      where: { testPlanRunId: testPlanRunIds },
      collectionJobAttributes: COLLECTION_JOB_ATTRIBUTES,
      collectionJobTestStatusAttributes: COLLECTION_JOB_TEST_STATUS_ATTRIBUTES,
      testPlanReportAttributes: [],
      testPlanRunAttributes: [],
      testPlanVersionAttributes: [],
      testPlanAttributes: [],
      atAttributes: [],
      browserAttributes: [],
      userAttributes: [],
      transaction: context.transaction
    });

    const jobsByRunId = {};
    collectionJobs.forEach(job => {
      jobsByRunId[job.testPlanRunId] = job;
    });

    return testPlanRunIds.map(runId => jobsByRunId[runId] || null);
  });
};

const collectionJobResolver = async (testPlanRun, args, context) => {
  if (!context.loaders) {
    context.loaders = {};
  }

  if (!context.loaders.collectionJobByTestPlanRunId) {
    context.loaders.collectionJobByTestPlanRunId =
      createCollectionJobBatchLoader(context);
  }

  const collectionJob = await context.loaders.collectionJobByTestPlanRunId.load(
    testPlanRun.id
  );

  if (collectionJob) {
    return { ...collectionJob.dataValues, __testPlanRunChild: true };
  }
  return collectionJob;
};

module.exports = collectionJobResolver;
