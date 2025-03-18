import getPage from '../util/getPage';
import { text } from './util';

describe('Versions page for pattern with highest report being recommended', () => {
  it('renders page h1', async () => {
    await getPage(
      { role: false, url: '/data-management/checkbox-tri-state' },
      async (page, { consoleErrors }) => {
        await text(
          page,
          'h1 ::-p-text(Checkbox Example (Tri State) Test Plan Versions)'
        );

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });
});

describe('Versions page for pattern with highest report being candidate', () => {
  it('renders page h1', async () => {
    await getPage(
      { role: false, url: '/data-management/modal-dialog' },
      async page => {
        await text(
          page,
          'h1 ::-p-text(Modal Dialog Example Test Plan Versions)'
        );
      }
    );
  });
});

describe('Versions page for pattern with highest report being draft', () => {
  it('renders page h1', async () => {
    await getPage(
      { role: false, url: '/data-management/alert' },
      async page => {
        await text(page, 'h1 ::-p-text(Alert Example Test Plan Versions)');
      }
    );
  });
});

describe('Versions page for pattern with highest report being R&D', () => {
  it('renders page h1', async () => {
    await getPage(
      { role: false, url: '/data-management/banner' },
      async page => {
        await text(page, 'h1 ::-p-text(Banner Landmark Test Plan Versions)');
      }
    );
  });
});

describe('Issues table interactions', () => {
  const TEST_URL = '/data-management/alert';

  it('displays correct issue counts in heading', async () => {
    await getPage({ role: false, url: TEST_URL }, async page => {
      await page.waitForSelector('[data-testid="issues-table"]');
      const headingText = await page.$eval(
        'h2#github-issues',
        el => el.textContent
      );
      expect(headingText.replace(/\s+/g, ' ').trim()).toBe(
        'GitHub Issues (1 open, 1 closed)'
      );
    });
  });

  it('filters issues correctly', async () => {
    await getPage({ role: false, url: TEST_URL }, async page => {
      await page.waitForSelector('[data-testid="issues-table"]');

      // Check initial state (Open filter should be active by default)
      const isOpenPressed = await page.$eval(
        '[data-testid="filter-open"]',
        el => el.getAttribute('aria-pressed')
      );
      expect(isOpenPressed).toBe('true');

      // Verify only open issues are shown initially
      let visibleIssues = await page.$$eval(
        '[data-testid="issue-row"]',
        rows => rows.length
      );
      let firstRowStatus = await page.$eval('[data-testid="issue-row"]', row =>
        row.getAttribute('data-status')
      );
      expect(visibleIssues).toBe(1);
      expect(firstRowStatus).toBe('open');

      // Click "Closed" filter
      await page.click('[data-testid="filter-closed"]');

      // Verify only closed issues are shown
      visibleIssues = await page.$$eval(
        '[data-testid="issue-row"]',
        rows => rows.length
      );
      firstRowStatus = await page.$eval('[data-testid="issue-row"]', row =>
        row.getAttribute('data-status')
      );
      expect(visibleIssues).toBe(1);
      expect(firstRowStatus).toBe('closed');

      // Click "All" filter
      await page.click('[data-testid="filter-all"]');

      // Verify all issues are shown
      visibleIssues = await page.$$eval(
        '[data-testid="issue-row"]',
        rows => rows.length
      );
      expect(visibleIssues).toBe(2);
    });
  });

  it('sorts issues by different columns', async () => {
    await getPage({ role: false, url: TEST_URL }, async page => {
      await page.waitForSelector('[data-testid="issues-table"]');

      // Click "All" filter first so we can see all issues
      await page.click('[data-testid="filter-all"]');
      await page.waitForSelector('[data-testid="issue-row"]');

      // Initial sort is by Status (ascending)
      let firstRowStatus = await page.$eval(
        '[data-testid="issue-row"]:first-child [data-testid="issue-status"]',
        el => el.textContent.trim()
      );
      expect(firstRowStatus).toBe('Open');

      // Click Status header to reverse sort
      await page.click('th[role="columnheader"] button::-p-text(Status)');

      // Wait for the table to update after sorting
      await page.waitForSelector('[data-testid="issue-row"]');

      firstRowStatus = await page.$eval(
        '[data-testid="issue-row"]:first-child [data-testid="issue-status"]',
        el => el.textContent.trim()
      );
      expect(firstRowStatus).toBe('Closed');

      // Test sorting by Author
      await page.click('th[role="columnheader"] button::-p-text(Author)');

      // Wait for the table to update after sorting
      await page.waitForSelector('[data-testid="issue-row"]');

      const firstRowAuthor = await page.$eval(
        '[data-testid="issue-row"]:first-child td:first-child',
        el => el.textContent.trim()
      );
      expect(firstRowAuthor).toBe('alflennik');
    });
  });

  it('maintains filter state when sorting changes', async () => {
    await getPage({ role: false, url: TEST_URL }, async page => {
      await page.waitForSelector('[data-testid="issues-table"]');

      // Select "Open" filter (should already be selected by default)
      await page.click('[data-testid="filter-open"]');

      // Sort by Author
      await page.click('th[role="columnheader"] button::-p-text(Author)');

      // Verify only open issues are still shown
      const visibleIssues = await page.$$eval(
        '[data-testid="issue-row"]',
        rows => ({
          length: rows.length,
          status: rows[0].getAttribute('data-status')
        })
      );
      expect(visibleIssues.length).toBe(1);
      expect(visibleIssues.status).toBe('open');
    });
  });
});
