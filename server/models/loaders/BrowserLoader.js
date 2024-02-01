const { getBrowsers } = require('../services/BrowserService');

let singletonInstance = null;

const BrowserLoader = () => {
    if (singletonInstance) {
        return singletonInstance;
    }

    let browsers;
    let activePromise;

    singletonInstance = {
        getAll: async () => {
            if (browsers) {
                return browsers;
            }

            if (activePromise) {
                return activePromise;
            }

            activePromise = getBrowsers().then(browsers => {
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
            });

            browsers = await activePromise;

            return browsers;
        },
        clearCache: () => {
            browsers = null;
            activePromise = null;
        }
    };
    return singletonInstance;
};

module.exports = BrowserLoader;
