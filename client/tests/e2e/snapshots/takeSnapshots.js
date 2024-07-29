/* eslint-disable no-console */
const fs = require('fs').promises;
const path = require('path');
const getPage = require('../../util/getPage');
const { setup, teardown } = require('../../util/getPage');
const {
  snapshotRoutes,
  cleanAndNormalizeSnapshot,
  routeToSnapshotFilename
} = require('./utils');

const SNAPSHOTS_DIR = path.join(__dirname, 'saved');

async function takeSnapshot(browser, role, route) {
  console.log(`Taking snapshot for ${route}`);
  try {
    let snapshot;
    await getPage({ role, url: route }, async page => {
      await page.waitForSelector('main');

      snapshot = await cleanAndNormalizeSnapshot(page);
    });

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

    for (const route of snapshotRoutes) {
      const snapshot = await takeSnapshot(browser, 'admin', route);
      if (!snapshot) {
        continue;
      }
      const fileName = routeToSnapshotFilename(route);
      await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
      console.log(`Recorded snapshot for ${route}`);
    }
  } catch (e) {
    console.warn('Error during snapshot:', e);
  } finally {
    await teardown();
  }
}

takeSnapshots().catch(console.error);
