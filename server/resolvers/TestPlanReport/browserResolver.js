const browserResolver = async (testPlanReport, _, context) => {
    const browsers = await context.browserLoader.getAll();

    return browsers.find(browser => browser.id === testPlanReport.browser.id);
};

module.exports = browserResolver;
