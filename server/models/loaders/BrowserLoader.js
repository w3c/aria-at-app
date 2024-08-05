const { getBrowsers } = require('../services/BrowserService');

const BrowserLoader = () => {
  let browsers;
  let activePromise;

  return {
    getAll: async ({ transaction }) => {
      if (browsers) {
        return browsers;
      }

      if (activePromise) {
        return activePromise;
      }

      activePromise = getBrowsers({ transaction }).then(browsers => {
        browsers = browsers
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(browser => ({
            ...browser.dataValues,
            candidateAts: browser.ats.filter(at => at.AtBrowsers.isCandidate),
            recommendedAts: browser.ats.filter(
              at => at.AtBrowsers.isRecommended
            )
          }));

        return browsers;
      });

      browsers = await activePromise;

      return browsers;
    }
  };
};

module.exports = BrowserLoader;
