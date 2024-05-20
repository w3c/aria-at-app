export const isSupportedByResponseCollector = ctx => {
    if (!ctx || !ctx.at || !ctx.browser) {
        return false;
    }
    return (
        (ctx.at.name === 'NVDA' &&
            (ctx.browser.name === 'Chrome' ||
                ctx.browser.name === 'Firefox')) ||
        (ctx.at.name === 'VoiceOver' && ctx.browser.name === 'Safari')
    );
};

/**
 * @param {} [at]
 * @param {} [browser]
 *
 * @returns {string|undefined}
 */
export const getBotUsernameFromAtBrowser = (at, browser) => {
    if (at?.name === 'NVDA' && browser?.name === 'Chrome') {
        return 'NVDA Bot';
    }
    if (at?.name === 'VoiceOver' && browser?.name === 'Safari') {
        return 'Safari Bot';
    }
};
