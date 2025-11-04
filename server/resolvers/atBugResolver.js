const { getAtBugById } = require('../models/services/AtBugService');

const atBugResolver = async (_, { id }, context) => {
  const { transaction } = context;
  return await getAtBugById({
    id,
    includeAssertions: false,
    transaction
  });
};

module.exports = atBugResolver;
