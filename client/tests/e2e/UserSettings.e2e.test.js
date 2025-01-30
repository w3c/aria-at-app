import getPage from '../util/getPage';
import { text } from './util';

describe('User Settings when not signed in', () => {
  it('does not render page if signed out', async () => {
    await getPage({ role: false, url: '/account/settings' }, async page => {
      const h1Text = await text(page, 'h1');
      const currentUrl = await page.url();

      expect(h1Text).toBe('Whoops! Unable to complete request');
      expect(currentUrl.includes('/invalid-request')).toBe(true);
    });
  });
});

describe('User Settings when signed in as vendor', () => {
  it('does not render page if signed in as vendor', async () => {
    await getPage({ role: 'vendor', url: '/account/settings' }, async page => {
      const h1Text = await text(page, 'h1');
      const currentUrl = await page.url();

      expect(h1Text).toBe('Whoops! Page not found');
      expect(currentUrl.includes('/404')).toBe(true);
    });
  });
});

describe('User Settings common traits', () => {
  it('renders page h1', async () => {
    await getPage({ role: 'tester', url: '/account/settings' }, async page => {
      const h1Text = await text(page, 'h1');
      expect(h1Text).toBe('Settings');
    });
  });

  it("renders tester's user details and assistive technology sections", async () => {
    await getPage({ role: 'tester', url: '/account/settings' }, async page => {
      await page.waitForSelector('h2 ::-p-text(User Details)');
      await page.waitForSelector('h2 ::-p-text(Assistive Technology Settings)');

      const tester = 'joe-the-tester';
      await page.waitForSelector(`p a[href="https://github.com/${tester}"]`);
    });
  });

  it("renders admin's user details and assistive technology sections", async () => {
    await getPage({ role: 'admin', url: '/account/settings' }, async page => {
      await page.waitForSelector('h2 ::-p-text(User Details)');
      await page.waitForSelector('h2 ::-p-text(Admin Actions)');

      const admin = 'joe-the-admin';
      await page.waitForSelector(`p a[href="https://github.com/${admin}"]`);
    });
  });
});

describe('User Settings when signed in as tester', () => {
  it('renders testable assistive technologies status and update on save', async () => {
    await getPage(
      { role: 'tester', url: '/account/settings' },
      async (page, { consoleErrors }) => {
        const testableAtsStatusTextBeforeSave = await text(
          page,
          'p[data-testid="testable-ats-status"]'
        );
        expect(testableAtsStatusTextBeforeSave).toBe(
          'You have not yet selected any assistive technologies.'
        );

        const jawsOptionSelector = 'input[id="1"][type="checkbox"]';
        const nvdaOptionSelector = 'input[id="2"][type="checkbox"]';
        const saveButtonSelector = 'button[type="submit"]';
        const saveButtonText = await text(page, saveButtonSelector);

        await page.click(jawsOptionSelector);
        await page.click(nvdaOptionSelector);
        await page.click(saveButtonSelector);

        await page.waitForNetworkIdle();

        const testableAtsStatusTextAfterSave = await text(
          page,
          'p[data-testid="testable-ats-status"]'
        );
        const selectedAtsListItems = await page.$eval('ul', el => {
          const liElements = el.querySelectorAll('li');
          return Array.from(liElements, li => li.innerText.trim());
        });

        expect(saveButtonText).toBe('Save');
        expect(testableAtsStatusTextAfterSave).toBe(
          'You can currently test the following assistive technologies:'
        );
        expect(selectedAtsListItems.length).toBe(2);
        expect(selectedAtsListItems.includes('JAWS')).toBe(true);
        expect(selectedAtsListItems.includes('NVDA')).toBe(true);

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });
});

describe('User Settings when signed in as admin', () => {
  it('renders admin actions section', async () => {
    await getPage(
      { role: 'admin', url: '/account/settings' },
      async (page, { consoleErrors }) => {
        await page.waitForSelector(
          'button ::-p-text(Import Latest Test Plan Versions)'
        );

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });
});
