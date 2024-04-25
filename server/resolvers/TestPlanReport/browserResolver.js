const browserResolver = async (testPlanReport, _, context) => {
    const { transaction, browserLoader } = context;

    const browsers = await browserLoader.getAll({ transaction });

    return browsers.find(browser => browser.id === testPlanReport.browser.id);
};

module.exports = browserResolver;
