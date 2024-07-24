/* eslint-disable no-console */
const fs = require('fs').promises;
const path = require('path');
const prettier = require('prettier');
const getPage = require('../../util/getPage');
const { setup, teardown } = require('../../util/getPage');

const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots');

async function shutdown() {
  console.log('Shutting down...');
  if (global.browser) {
    await global.browser.close();
  }
  await teardown();
  console.log('Shutdown complete');
}

async function getRoutes() {
  return [
    '/',
    '/signup-instructions',
    '/account/settings',
    '/test-queue',
    '/reports',
    '/candidate-review',
    '/data-management',
    '/404',
    '/test-plan-report/1',
    '/test-review/8',
    '/run/2',
    '/data-management/meter',
    '/candidate-test-plan/24/1'
  ];
}

async function takeSnapshot(browser, role, route) {
  console.log(`Taking snapshot for ${route}`);
  try {
    let snapshot;
    await getPage({ role, url: route }, async page => {
      await page.waitForSelector('main');

      // Remove all <style> and <link rel="stylesheet"> elements
      await page.evaluate(() => {
        const stylesToRemove = document.querySelectorAll(
          'style, link[rel="stylesheet"]'
        );
        stylesToRemove.forEach(el => el.remove());
      });

      const content = await page.content();

      // Strip out randomly generated ids, "id=react-aria*"
      // Currently relevant for the /test-queue page
      const cleanedContent = content.replace(
        /id="react-aria\d+-:r[0-9a-z]+:"/g,
        ''
      );

      // Prettify the HTML using Prettier, otherwise it is minified
      // and it would be difficult to read diffs
      const prettifiedHtml = await prettier.format(cleanedContent, {
        parser: 'html',
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSameLine: true
      });

      snapshot = prettifiedHtml;
    });

    if (!snapshot) {
      throw new Error('Snapshot is undefined');
    }

    return snapshot;
  } catch (error) {
    console.warn(`Error taking snapshot for ${route}:`, error);
    return null;
  }
}

async function takeSnapshots() {
  try {
    const browser = await setup();
    global.browser = browser;

    const routes = await getRoutes();

    for (const route of routes) {
      const snapshot = await takeSnapshot(browser, 'admin', route);
      if (!snapshot) {
        continue;
      }
      const fileName = `${route.replace(/\//g, '_')}.html`;
      await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
      console.log(`Recorded snapshot for ${route}`);
    }
  } catch (e) {
    console.warn('Error during snapshot taking:', e);
  } finally {
    await shutdown();
  }
}

takeSnapshots().catch(console.error);
