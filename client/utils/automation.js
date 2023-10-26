export const isSupportedByResponseCollector = ({ at, browser }) =>
    at?.name === 'NVDA' && browser?.name === 'Chrome';

export const isBot = user => user?.username?.toLowerCase().slice(-3) === 'bot';

export const isAssertionValidated = assertion => {
    return (
        assertion.passed ||
        (assertion.failedReason &&
            assertion.failedReason !== 'AUTOMATED_OUTPUT')
    );
};

// TODO: Stub, support for more bot users should be added
export const getBotUserFromAtBrowser = (at, browser) => {
    if (at?.name === 'NVDA' && browser?.name === 'Chrome') {
        return {
            username: 'NVDA Bot'
        };
    }
};
