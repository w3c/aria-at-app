const {
  getTestPlanVersions
} = require('../models/services/TestPlanVersionService');

const latestTestPlanVersionResolver = async (_, __, context) => {
  const { transaction } = context;

  const testPlanVersions = await getTestPlanVersions({
    testPlanReportAttributes: [],
    atAttributes: [],
    browserAttributes: [],
    testPlanRunAttributes: [],
    userAttribute: [],
    pagination: {
      limit: 1,
      order: [['updatedAt', 'desc']]
    },
    transaction
  });

  return testPlanVersions[0];
};

module.exports = latestTestPlanVersionResolver;
