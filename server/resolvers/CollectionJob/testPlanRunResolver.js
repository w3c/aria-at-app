// eslint-disable-next-line no-unused-vars
const testPlanRunResolver = (collectionJob, _, context) => {
  if (collectionJob.__testPlanRunChild) {
    throw new Error('can not request TestPlanRun.collectionJob.testPlanRun');
  }
  return collectionJob.testPlanRun;
};
module.exports = testPlanRunResolver;
