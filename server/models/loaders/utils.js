const clearCachedAts = async () => {
    const AtLoader = require('./AtLoader');
    await AtLoader().clearCache();
};

const clearCachedBrowsers = () => {
    const BrowserLoader = require('./BrowserLoader');
    BrowserLoader().clearCache();
};

module.exports = {
    clearCachedAts,
    clearCachedBrowsers
};
