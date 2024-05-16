import getPage from '../../tests/util/getPage';

describe('Test Queue', () => {
    const clearEntireTestQueue = () => {};

    it('renders error message when no test plan reports exist', async () => {
        console.log('starting test');
        await getPage({ role: 'admin', url: '/test-queue-2' }, async page => {
            await clearEntireTestQueue();
            await page.waitForSelector(
                '::-p-text(There are no test plan reports to show.)'
            );
            console.log('success');
        });
        expect(true).toBe(false);
    });
});
