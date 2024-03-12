const BrowserLoader = require('../../models/loaders/BrowserLoader');

const browserResolver = async (testPlanReport, _, context) => {
    const { transaction } = context;

    const browserLoader = BrowserLoader();
    const browsers = await browserLoader.getAll({ transaction });

    return browsers.find(browser => browser.id === testPlanReport.browser.id);
};

module.exports = browserResolver;
