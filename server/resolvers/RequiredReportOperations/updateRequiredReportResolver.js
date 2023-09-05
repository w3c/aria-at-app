const { AuthenticationError } = require('apollo-server');
const { updateAtBrowser } = require('../../models/services/AtBrowserService');

const updateRequiredReportResolver = async (
    { parentContext: { atId, browserId, phase } },
    { atId: inputAtId, browserId: inputBrowserId },
    // input,
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    let updateParams = {};

    if (phase === 'IS_CANDIDATE') {
        updateParams = { isCandidate: false };
        await updateAtBrowser({ atId, browserId }, updateParams);
        updateParams = { isCandidate: true };
        await updateAtBrowser(
            { atId: inputAtId, browserId: inputBrowserId },
            updateParams
        );
    }
    if (phase === 'IS_RECOMMENDED') {
        updateParams = { isRecommended: false };
        await updateAtBrowser({ atId, browserId }, updateParams);
        updateParams = { isRecommended: true };
        await updateAtBrowser(
            { atId: inputAtId, browserId: inputBrowserId },
            updateParams
        );
    }

    return true;
};

module.exports = updateRequiredReportResolver;
