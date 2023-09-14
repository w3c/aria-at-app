const { AuthenticationError } = require('apollo-server');
const { updateAtBrowser } = require('../../models/services/AtBrowserService');

const deleteRequiredReportResolver = async (
    { parentContext: { atId, browserId, phase } },
    _,
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    let updateParams = {};

    if (phase === 'IS_CANDIDATE') {
        updateParams = { isCandidate: false };
    }
    if (phase === 'IS_RECOMMENDED') {
        updateParams = { isRecommended: false };
    }

    await updateAtBrowser({ atId, browserId }, updateParams);

    return { atId, browserId, phase };
};

module.exports = deleteRequiredReportResolver;
