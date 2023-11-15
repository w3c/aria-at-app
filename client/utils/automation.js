export const isSupportedByResponseCollector = ctx => {
    if (!ctx || !ctx.at || !ctx.browser) {
        return false;
    }
    return ctx.at.name === 'NVDA' && ctx.browser.name === 'Chrome';
};

export const isBot = user => user?.username?.toLowerCase().slice(-3) === 'bot';

export const isAssertionValidated = assertion => {
    return (
        assertion.passed ||
        (assertion.failedReason &&
            assertion.failedReason !== 'AUTOMATED_OUTPUT')
    );
};

// TODO: Stub, support for more bot users should be added
export const getBotUsernameFromAtBrowser = (at, browser) => {
    if (at?.name === 'NVDA' && browser?.name === 'Chrome') {
        return 'NVDA Bot';
    }
};
