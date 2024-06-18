import getPage from './util/getPage';

describe('smoke test', () => {
  it('end-to-end tests can simultaneously sign in with all roles', async () => {
    await Promise.all([
      getPage({ role: 'admin', url: '/test-queue' }, async page => {
        // Only admins can remove rows from the test queue
        await page.waitForSelector('td.actions ::-p-text(Remove)');
      }),

      getPage({ role: 'tester', url: '/test-queue' }, async page => {
        // Testers can assign themselves
        await page.waitForSelector('table ::-p-text(Assign Yourself)');
        const adminOnlyRemoveButton = await page.$(
          'td.actions ::-p-text(Remove)'
        );
        expect(adminOnlyRemoveButton).toBe(null);
      }),

      getPage(
        { role: 'vendor', url: '/test-queue' },
        async (page, { baseUrl }) => {
          // Vendors get the same test queue as signed-out users
          await page.waitForSelector('td.actions ::-p-text(View tests)');
          // Unlike signed-out users, they will get tables on this page
          await page.goto(`${baseUrl}/candidate-review`);
          await page.waitForSelector('table');
        }
      ),

      getPage({ role: false, url: '/test-queue' }, async page => {
        // Signed-out users can only view tests, not run them
        await page.waitForSelector('td.actions ::-p-text(View tests)');
      })
    ]);
  });

  it('loads various pages without crashing', async () => {
    await Promise.all([
      getPage({ role: false, url: '/' }, async page => {
        await page.waitForSelector('h1');
        const h1Handle = await page.waitForSelector('h1');
        const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
        expect(h1Text).toBe(
          'Enabling Interoperability for Assistive Technology Users'
        );
      }),
      getPage({ role: false, url: '/reports' }, async page => {
        // Wait for an h2 because an h1 will show while the page is
        // still loading
        await page.waitForSelector('h2');
        const h1Handle = await page.waitForSelector('h1');
        const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
        expect(h1Text).toBe('Assistive Technology Interoperability Reports');
      }),
      getPage({ role: false, url: '/data-management' }, async page => {
        // Wait for an h2 because an h1 will show while the page is
        // still loading
        await page.waitForSelector('h2');
        const h1Handle = await page.waitForSelector('h1');
        const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
        expect(h1Text).toBe('Data Management');
      })
    ]);
  });
});
