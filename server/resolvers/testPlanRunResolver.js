const DataLoader = require('dataloader');
const { getTestPlanRuns } = require('../models/services/TestPlanRunService');

const createTestPlanRunBatchLoader = context => {
  return new DataLoader(async testPlanRunIds => {
    const runs = await getTestPlanRuns({
      where: { id: testPlanRunIds },
      transaction: context.transaction
    });

    const runsById = {};
    runs.forEach(run => {
      runsById[run.id] = run;
    });

    return testPlanRunIds.map(id => runsById[id] || null);
  });
};

const testPlanRunResolver = async (_, { id }, context) => {
  if (!context.loaders) {
    context.loaders = {};
  }

  if (!context.loaders.testPlanRunById) {
    context.loaders.testPlanRunById = createTestPlanRunBatchLoader(context);
  }

  return context.loaders.testPlanRunById.load(id);
};

module.exports = testPlanRunResolver;
