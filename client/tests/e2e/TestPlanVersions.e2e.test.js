import getPage from '../util/getPage';
import { text } from './util';

const testVersionsPage = async (url, title, hasGitHubIssues = true) => {
  await getPage({ role: false, url }, async page => {
    // Check page title
    await text(page, `h1 ::-p-text(${title} Test Plan Versions)`);

    // Check for commit history link
    await text(
      page,
      `a[href^="https://github.com/w3c/aria-at/commits/master/tests/"] ::-p-text(Commit History for aria-at/tests/)`
    );

    // Check for Version Summary table
    await page.waitForSelector('#version-summary');
    await text(page, 'th ::-p-text(Version)');
    await text(page, 'th ::-p-text(Latest Phase)');
    await text(page, 'th ::-p-text(Phase Change Date)');

    // Check for GitHub Issues table
    await page.waitForSelector('#github-issues');
    if (hasGitHubIssues) {
      await text(page, 'th ::-p-text(Author)');
      await text(page, 'th ::-p-text(Issue)');
      await text(page, 'th ::-p-text(Status)');
      await text(page, 'th ::-p-text(AT)');
      await text(page, 'th ::-p-text(Created On)');
      await text(page, 'th ::-p-text(Closed On)');
    } else {
      await text(page, '::-p-text(No GitHub Issues)');
    }

    // Check for Timeline for All Versions table
    await page.waitForSelector('#timeline-for-all-versions');
    await text(page, 'th ::-p-text(Date)');
    await text(page, 'th ::-p-text(Event)');

    // Check for Version History disclosure component
    await page.waitForSelector('#disclosure-btn-versionHistory-0');
    await page.click('#disclosure-btn-versionHistory-0');

    // Check for elements inside the expanded Version History
    await text(
      page,
      'a[href^="https://github.com/w3c/aria-at/commit/"] ::-p-text(Commit)'
    );
    await text(page, 'a[href^="/test-review/"] ::-p-text(View tests in)');
    await text(page, 'dt ::-p-text(Covered AT)');
    await page.waitForSelector('.timeline-for-version-table');
  });
};

describe('Versions page for pattern with highest report being recommended', () => {
  it('renders page content correctly', async () => {
    await testVersionsPage(
      '/data-management/checkbox-tri-state',
      'Checkbox Example (Tri State)',
      false
    );
  });
});

describe('Versions page for pattern with highest report being candidate', () => {
  it('renders page content correctly', async () => {
    await testVersionsPage(
      '/data-management/modal-dialog',
      'Modal Dialog Example'
    );
  });
});

describe('Versions page for pattern with highest report being draft', () => {
  it('renders page content correctly', async () => {
    await testVersionsPage('/data-management/alert', 'Alert Example');
  });
});

describe('Versions page for pattern with highest report being R&D', () => {
  it('renders page content correctly', async () => {
    await testVersionsPage('/data-management/banner', 'Banner Landmark', false);
  });
});
