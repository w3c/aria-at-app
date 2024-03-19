const BrowserLoader = require('../models/loaders/BrowserLoader');

const browsersResolver = async (_, __, context) => {
  const { transaction } = context;

  const browserLoader = BrowserLoader();
  return browserLoader.getAll({ transaction });
};

module.exports = browsersResolver;
