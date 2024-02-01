import getPage, { setup, teardown } from './util/getPage';

describe('smoke test', () => {
    beforeAll(async () => {
        console.log('starting setup');
        // TODO: In a future iteration the server start and close functions should
        // be handled in one place by Jest's setup and teardown scripts
        await setup();
        console.log('ended setup');
    }, 60000);

    afterAll(async () => {
        console.log('starting teardown');
        await teardown();
        console.log('ended teardown');
    }, 60000);

    it('can sign in as admin, tester, vendor, or logged out', async () => {
        console.log('starting test 1');
        // await Promise.all([
        await getPage({ role: 'admin', url: '/test-queue' }, async page => {
            // Only admins can remove rows from the test queue
            await page.waitForSelector('td.actions ::-p-text(Remove)');
        });

        await getPage({ role: 'tester', url: '/test-queue' }, async page => {
            // Testers can assign themselves
            await page.waitForSelector('table ::-p-text(Assign Yourself)');
            const adminOnlyRemoveButton = await page.$(
                'td.actions ::-p-text(Remove)'
            );
            expect(adminOnlyRemoveButton).toBe(null);
        });

        await getPage(
            { role: 'vendor', url: '/test-queue' },
            async (page, { baseUrl }) => {
                // Vendors get the same test queue as signed-out users
                await page.waitForSelector('td.actions ::-p-text(View tests)');
                // Unlike signed-out users, they will get tables on this page
                await page.goto(`${baseUrl}/candidate-review`);
                await page.waitForSelector('table');
            }
        );

        await getPage({ role: false, url: '/test-queue' }, async page => {
            // Signed-out users can only view tests, not run them
            await page.waitForSelector('td.actions ::-p-text(View tests)');
        });
        // ]);
        console.log('ended test 1');
    }, 60000);

    it('loads various pages without crashing', async () => {
        console.log('starting test 2');
        // await Promise.all([
        await getPage({ role: false, url: '/' }, async page => {
            await page.waitForSelector('h1');
            const h1Handle = await page.waitForSelector('h1');
            const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
            expect(h1Text).toBe(
                'Enabling Interoperability for Assistive Technology Users'
            );
        });
        await getPage({ role: false, url: '/reports' }, async page => {
            // Wait for an h2 because an h1 will show while the page is
            // still loading
            await page.waitForSelector('h2');
            const h1Handle = await page.waitForSelector('h1');
            const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
            expect(h1Text).toBe(
                'Assistive Technology Interoperability Reports'
            );
        });
        await getPage({ role: false, url: '/data-management' }, async page => {
            await page.waitForSelector('h2');
            const h1Handle = await page.waitForSelector('h1');
            const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
            expect(h1Text).toBe('Data Management');
        });
        // ]);
        console.log('ended test 2');
    }, 60000);
});
