const { AuthenticationError } = require('apollo-server');
const { updateAtBrowser } = require('../../models/services/AtBrowserService');

const updateRequiredReportResolver = async (
  { parentContext: { atId, browserId, phase } },
  { atId: inputAtId, browserId: inputBrowserId },
  context
) => {
  const { user, transaction } = context;
  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  let updateParams = {};

  // These conditionals will change values in the At/Browsers table
  // in the database. Each updateAtBrowser() call changes the boolean value
  // for a particular row in the database. The booleans for two row need to be
  // changed. So we call updateAtBrowser() twice.
  if (phase === 'CANDIDATE') {
    updateParams = { isCandidate: false };
    await updateAtBrowser({ atId, browserId, updateParams, transaction });
    updateParams = { isCandidate: true };
    await updateAtBrowser({
      atId: inputAtId,
      browserId: inputBrowserId,
      updateParams,
      transaction
    });
  }
  if (phase === 'RECOMMENDED') {
    updateParams = { isRecommended: false };
    await updateAtBrowser({ atId, browserId, updateParams, transaction });
    updateParams = { isRecommended: true };
    await updateAtBrowser({
      atId: inputAtId,
      browserId: inputBrowserId,
      updateParams,
      transaction
    });
  }

  return { atId: inputAtId, browserId: inputBrowserId, phase };
};

module.exports = updateRequiredReportResolver;
