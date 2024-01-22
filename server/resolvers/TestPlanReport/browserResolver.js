const BrowserLoader = require('../../models/loaders/BrowserLoader');

const browserResolver = async testPlanReport => {
    const browserLoader = BrowserLoader();
    const browsers = await browserLoader.getAll();

    return browsers.find(browser => browser.id === testPlanReport.browser.id);
};

module.exports = browserResolver;
