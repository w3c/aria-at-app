// This file is copied mostly verbatim from https://jestjs.io/docs/puppeteer

const { readFile } = require('fs').promises;
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');
const NodeEnvironment = require('jest-environment-node').TestEnvironment;

const isDebugMode = process.argv.some(arg => arg.startsWith('--testTimeout'));

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

class PuppeteerEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);
    }

    async setup() {
        await super.setup();
        // get the wsEndpoint
        console.log('breakpoint2');
        const wsEndpoint = await readFile(path.join(DIR, 'wsEndpoint'), 'utf8');
        if (!wsEndpoint) {
            throw new Error('wsEndpoint not found');
        }

        // connect to puppeteer
        this.global.browser = await puppeteer.connect({
            browserWSEndpoint: wsEndpoint
        });
    }

    async teardown() {
        if (this.global.browser) {
            this.global.browser.disconnect();
        }
        await super.teardown();
    }

    getVmContext() {
        return super.getVmContext();
    }
}

class DoNothingEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);
    }
}

module.exports = isDebugMode ? DoNothingEnvironment : PuppeteerEnvironment;
