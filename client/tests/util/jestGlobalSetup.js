const { mkdir, writeFile } = require('fs/promises');
const os = require('os');
const path = require('path');
const { setup } = require('./getPage');

const isDebugMode = process.argv.some(arg => arg.startsWith('--testTimeout'));

module.exports = async () => {
    const browser = await setup();

    // See https://jestjs.io/docs/puppeteer for more information

    // store the browser instance so we can teardown it later
    // this global is only available in the teardown but not in TestEnvironments
    global.browser = browser;

    // if (!isDebugMode) {
    // use the file system to expose the wsEndpoint for TestEnvironments
    const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');
    await mkdir(DIR, { recursive: true });
    console.log('breakpoint1');
    await writeFile(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
    // }
};
