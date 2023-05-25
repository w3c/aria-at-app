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

            return browsers;
        }
    };
};

module.exports = BrowserLoader;
