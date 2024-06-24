const { getTestPlanRunById } = require('../models/services/TestPlanRunService');

const testPlanRunResolver = async (_, { id }, context) => {
  const { transaction } = context;

  return getTestPlanRunById({ id, transaction });
};

module.exports = testPlanRunResolver;
