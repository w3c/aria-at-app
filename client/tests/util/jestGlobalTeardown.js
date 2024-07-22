const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { teardown } = require('./getPage');

module.exports = async () => {
  // See https://jestjs.io/docs/puppeteer for more information
  // clean-up the wsEndpoint file
  const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');
  await fs.rm(DIR, { recursive: true, force: true });

  await teardown();
};
