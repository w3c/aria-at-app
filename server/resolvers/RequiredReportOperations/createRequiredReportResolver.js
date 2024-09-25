const { AuthenticationError } = require('apollo-server');
const { updateAtBrowser } = require('../../models/services/AtBrowserService');

const createRequiredReportResolver = async (
  { parentContext: { atId, browserId, phase } },
  _,
  context
) => {
  const { user, transaction } = context;
  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  let updateParams = {};

  if (phase === 'CANDIDATE') {
    updateParams = { isCandidate: true };
  }
  if (phase === 'RECOMMENDED') {
    updateParams = { isRecommended: true };
  }

  await updateAtBrowser({ atId, browserId, updateParams, transaction });

  return { atId, browserId, phase };
};

module.exports = createRequiredReportResolver;
