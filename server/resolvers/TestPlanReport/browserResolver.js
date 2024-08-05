const browserResolver = async (testPlanReport, _, context) => {
  const { transaction, browserLoader } = context;

  const browsers = await browserLoader.getAll({ transaction });

  return browsers.find(browser => browser.id === testPlanReport.browserId);
};

module.exports = browserResolver;
