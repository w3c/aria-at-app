import getPage, { setup, teardown } from './util/getPage';

describe('smoke test', () => {
    beforeAll(async () => {
        // TODO: In a future iteration the server start and close functions should
        // be handled in one place by Jest's setup and teardown scripts
        await setup();
    }, 30000);

    afterAll(async () => {
        await teardown();
    }, 30000);

    it('can sign in as admin, tester, vendor, or logged out', async () => {
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
                    await page.waitForSelector(
                        'td.actions ::-p-text(View tests)'
                    );
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
    }, 10000);

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
                expect(h1Text).toBe(
                    'Assistive Technology Interoperability Reports'
                );
            }),
            getPage({ role: false, url: '/data-management' }, async page => {
                await page.waitForSelector('h2');
                const h1Handle = await page.waitForSelector('h1');
                const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
                expect(h1Text).toBe('Data Management');
            })
        ]);
    }, 10000);
});
