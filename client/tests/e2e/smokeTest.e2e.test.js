import getPage from '../util/getPage';
import { text } from './util';

describe('smoke test', () => {
  it('end-to-end tests can simultaneously sign in with all roles', async () => {
    await Promise.all([
      getPage({ role: 'admin', url: '/test-queue' }, async page => {
        // Wait for page load
        await page.waitForSelector('div[data-testid="page-status"]');

        // Only admins can remove rows from the test queue
        await page.waitForSelector(
          'td [type="button"] ::-p-text(Delete Report)'
        );
      }),
      getPage({ role: 'tester', url: '/test-queue' }, async page => {
        // Wait for page load
        await page.waitForSelector('div[data-testid="page-status"]');

        // Testers can assign themselves
        await page.waitForSelector('table ::-p-text(Assign Yourself)');
        const adminOnlyRemoveButton = await page.$(
          'td [type="button"] ::-p-text(Delete Report)'
        );
        expect(adminOnlyRemoveButton).toBe(null);
      }),
      getPage(
        { role: 'vendor', url: '/test-queue' },
        async (page, { baseUrl }) => {
          // Wait for page load
          await page.waitForSelector('div[data-testid="page-status"]');

          // Vendors get the same test queue as signed-out users
          await page.waitForSelector('button ::-p-text(V22.04.14)');
          await page.click('button ::-p-text(V22.04.14)');

          await page.waitForSelector('td [role="button"]');
          const buttonText = await page.$eval(
            'td [role="button"]',
            button => button.textContent
          );
          expect(buttonText).toEqual('View Tests');

          // Unlike signed-out users, they will get tables on this page
          await page.goto(`${baseUrl}/candidate-review`);
          await page.waitForSelector('table');
        }
      ),
      getPage({ role: false, url: '/test-queue' }, async page => {
        // Signed-out users can only view tests, not run them
        await page.waitForSelector('td [role="button"] ::-p-text(View Tests)');
      })
    ]);
  });

  it('loads various pages without crashing', async () => {
    await Promise.all([
      getPage({ role: false, url: '/' }, async page => {
        await page.waitForSelector('h1');
        const h1Text = await text(page, 'h1');
        expect(h1Text).toBe(
          'Enabling Interoperability for Assistive Technology Users'
        );
      }),
      getPage({ role: false, url: '/reports' }, async page => {
        // Wait for an h2 because an h1 will show while the page is
        // still loading
        await page.waitForSelector('h2');
        const h1Text = await text(page, 'h1');
        expect(h1Text).toBe('Assistive Technology Interoperability Reports');
      }),
      getPage({ role: false, url: '/data-management' }, async page => {
        // Wait for an h2 because an h1 will show while the page is
        // still loading
        await page.waitForSelector('h2');
        const h1Text = await text(page, 'h1');
        expect(h1Text).toBe('Data Management');
      }),
      getPage({ role: false, url: '/test-plan-report/15' }, async page => {
        // Wait for an h2 because an h1 will show while the page is
        // still loading
        await page.waitForSelector('h2');
        const h1Text = await text(page, 'h1');
        expect(h1Text).toBe(
          'Test 1:\nNavigate forwards to a not pressed toggle button'
        );
      }),
      getPage({ role: 'admin', url: '/test-plan-report/15' }, async page => {
        // Wait for an h2 because an h1 will show while the page is
        // still loading
        await page.waitForSelector('h2');
        const h1Text = await text(page, 'h1');
        expect(h1Text).toBe(
          'Test 1:\nNavigate forwards to a not pressed toggle button'
        );
      })
    ]);
  });
});
