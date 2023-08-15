const { getBrowsers } = require('../services/BrowserService');

const BrowserLoader = () => {
    let browsers;
    let activePromise;

    return {
        getAll: async () => {
            if (browsers) {
                return browsers;
            }

            if (activePromise) {
                return activePromise;
            }

            activePromise = getBrowsers();

            browsers = await activePromise;

            browsers = browsers.map(browser => ({
                ...browser.dataValues,
                candidateAts: browser.ats.filter(
                    at => at.AtBrowsers.isCandidate
                ),
                recommendedAts: browser.ats.filter(
                    at => at.AtBrowsers.isRecommended
                )
            }));

            return browsers;
        }
    };
};

module.exports = BrowserLoader;
