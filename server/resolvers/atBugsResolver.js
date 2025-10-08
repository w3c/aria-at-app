const {
  getAtBugs,
  getAtBugsByAtId
} = require('../models/services/AtBugService');

const atBugsResolver = async (_, { atId }, context) => {
  const { transaction } = context;

  if (atId) {
    return await getAtBugsByAtId({
      atId,
      transaction
    });
  }

  return await getAtBugs({
    transaction
  });
};

module.exports = atBugsResolver;

