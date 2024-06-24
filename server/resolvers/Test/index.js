const scenarios = require('./scenariosResolver');
const assertions = require('./assertionsResolver');
const renderableContent = require('./renderableContentResolver');
const renderableContents = require('./renderableContentsResolver');
const renderedUrl = require('./renderedUrlResolver');
const renderedUrls = require('./renderedUrlsResolver');

module.exports = {
  scenarios,
  assertions,
  renderableContent,
  renderableContents,
  renderedUrl,
  renderedUrls
};
