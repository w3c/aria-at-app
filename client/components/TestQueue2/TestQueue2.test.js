import getPage from '../../tests/util/getPage';

describe('Test Queue', () => {
    const clearEntireTestQueue = () => {
        console.error('IMPLEMENT clearEntireTestQueue');
    };

    it('renders Test Queue page h1', async () => {
        await getPage({ role: 'admin', url: '/test-queue-2' }, async page => {
            const h1Element = await page.$eval('h1', element => {
                return element.innerHTML;
            });
            expect(h1Element).toBe('Test Queue');
        });
    });

    it.skip('renders error message when no test plan reports exist', async () => {
        await getPage({ role: 'admin', url: '/test-queue-2' }, async page => {
            await clearEntireTestQueue();
            await page.waitForSelector(
                '::-p-text(There are currently no test plan reports to show.)'
            );
        });
        expect(true).toBe(false);
    });
});
