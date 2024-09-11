const { AuthenticationError } = require('apollo-server');
const { updateAtBrowser } = require('../../models/services/AtBrowserService');

const deleteRequiredReportResolver = async (
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
    updateParams = { isCandidate: false };
  }
  if (phase === 'RECOMMENDED') {
    updateParams = { isRecommended: false };
  }

  await updateAtBrowser({ atId, browserId, updateParams, transaction });

  return { atId, browserId, phase };
};

module.exports = deleteRequiredReportResolver;
