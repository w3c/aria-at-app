import getPage from './util/getPage';

describe('AT Version UI', () => {
  test('should add, edit, then remove an AtVersion', async () => {
    /* prettier-ignore */
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
            const openTrayIfClosed = async () => {
                await page.waitForSelector('button ::-p-text(Manage Assistive Technology Versions)');
                const isTrayClosed = !!(await page.$('::-p-text(Select an assistive technology and manage its versions)'));
                if (isTrayClosed) {
                    await page.click('button ::-p-text(Manage Assistive Technology Versions)');
                    await page.waitForSelector('::-p-text(Select an assistive technology and manage its versions)');
                }
            };
            await openTrayIfClosed();
            await page.click('button ::-p-text(Add a New Version)');
            await page.waitForSelector('.modal-title ::-p-text(Add a New Version for JAWS)');
            await page.waitForSelector('.modal-body .form-group:nth-child(1) ::-p-text(Version Number)');
            await page.waitForSelector('.modal-body .form-group:nth-child(2) ::-p-text(Approximate date of availability)');
            await page.type('.modal-body .form-group:nth-child(1) input', '99.0.1');
            await page.type('.modal-body .form-group:nth-child(2) input', '01-01-2000');
            await page.click('.modal-footer button ::-p-text(Add Version)');
            await page.waitForNetworkIdle({ idleTime: 5000 });
            await page.click('.modal-footer button ::-p-text(Ok)');
            await page.waitForSelector('.at-versions-container option:nth-child(2) ::-p-text(99.0.1)');
            const optionValue = await page.$eval('.at-versions-container option:nth-child(2)', option => option.value);
            await page.select('.at-versions-container select', optionValue);
            await page.click('.at-versions-container button ::-p-text(Edit)');
            const input = await page.waitForSelector('.modal-body .form-group:nth-child(1) input');
            for (let i = 0; i < 6; i += 1) {
                await input.press('Backspace');
            }
            await page.type('.modal-body .form-group:nth-child(1) input', '99.0.99');
            await page.click('.modal-footer button ::-p-text(Save)');
            await page.waitForNetworkIdle({ idleTime: 5000 });
            await page.click('.modal-footer button ::-p-text(Ok)');
            await page.waitForSelector('.at-versions-container option ::-p-text(99.0.99)');
            await page.select('.at-versions-container select', optionValue);
            await page.click('.at-versions-container button ::-p-text(Remove)');
            await page.waitForSelector('.modal-title ::-p-text(Remove JAWS Version 99.0.99)');
            await page.click('.modal-footer button ::-p-text(Remove)');
            await page.waitForNetworkIdle();
            const option = await page.$('.at-versions-container option ::-p-text(99.0.99)');
            expect(option).toBeNull();
        });
  });
});
