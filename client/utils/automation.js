export const isSupportedByResponseCollector = ctx => {
    if (!ctx || !ctx.at || !ctx.browser) {
        return false;
    }
    const {
        at: { key: atKey },
        browser: { key: browserKey }
    } = ctx;
    return (
        (atKey === 'nvda' &&
            (browserKey === 'chrome' || browserKey === 'firefox')) ||
        (atKey === 'voiceover_macos' && browserKey === 'safari_macos')
    );
};

/**
 * @param {} [at]
 * @param {} [browser]
 *
 * @returns {string|undefined}
 */
export const getBotUsernameFromAtBrowser = (at, browser) => {
    if (
        at?.key === 'nvda' &&
        (browser?.key === 'chrome' || browser?.key === 'firefox')
    ) {
        return 'NVDA Bot';
    }
    if (at?.key === 'voiceover_macos' && browser?.key === 'safari_macos') {
        return 'VoiceOver Bot';
    }
};
