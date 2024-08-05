import fs from 'fs/promises';
import path from 'path';
import {
  snapshotRoutes,
  cleanAndNormalizeSnapshot,
  routeToSnapshotFilename
} from './utils';
import getPage from '../../util/getPage';

const SNAPSHOTS_DIR = path.join(__dirname, 'saved');

describe('Snapshot Comparison', () => {
  snapshotRoutes.forEach(route => {
    test(`should match snapshot for ${route}`, async () => {
      await getPage({ role: 'admin', url: route }, async page => {
        await page.waitForSelector('main');

        const currentSnapshot = await cleanAndNormalizeSnapshot(page);

        const fileName = routeToSnapshotFilename(route);
        const snapshotPath = path.join(SNAPSHOTS_DIR, fileName);

        const existingSnapshot = await fs.readFile(snapshotPath, 'utf-8');
        expect(currentSnapshot.trim()).toBe(existingSnapshot.trim());
      });
    });
  });
});
