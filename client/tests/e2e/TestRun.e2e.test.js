import getPage from '../util/getPage';
import { text } from './util';

describe('Test Run when not signed in', () => {
  it('renders invalid request when attempting to go directly to /run/:id', async () => {
    await getPage({ role: false, url: '/run/19' }, async page => {
      const h1Text = await text(page, 'h1');
      const currentUrl = await page.url();

      expect(h1Text).toBe('Whoops! Unable to complete request');
      expect(currentUrl.includes('/invalid-request')).toBe(true);
    });
  });

  it('renders /test-plan-report/:id and can navigate between tests', async () => {
    // This should be NVDA + Chrome + Modal Dialog Example with 12 tests
    await getPage({ role: false, url: '/test-plan-report/19' }, async page => {
      const h1Text = await text(page, 'h1');
      const currentUrl = await page.url();

      const testNavigatorListSelector = 'nav#test-navigator-nav ol';
      await page.waitForSelector(testNavigatorListSelector);
      const testNavigatorListItemsHandle = await page.evaluateHandle(() => {
        const testNavigatorListSelector = 'nav#test-navigator-nav ol';
        const testNavigatorList = document.querySelector(
          testNavigatorListSelector
        );
        return Array.from(testNavigatorList.querySelectorAll('li'));
      });

      const testNavigatorListItemsMap =
        await testNavigatorListItemsHandle.getProperties();
      const testNavigatorListItems = Array.from(
        testNavigatorListItemsMap.values()
      );
      const listItemsLength = testNavigatorListItems.length;

      // Click each navigation item and confirm the h1 on page has changed
      for (const [index, li] of testNavigatorListItems.entries()) {
        await li.evaluate(el => el.querySelector('a').click());
        await page.waitForSelector(`h1 ::-p-text(Test ${index + 1}:)`);
        await page.waitForSelector(
          `div[class="info-label"] ::-p-text(Test Plan:)`
        );
        await page.waitForSelector(`div[class="info-label"] ::-p-text(AT:)`);
        await page.waitForSelector(
          `div[class="info-label"] ::-p-text(Browser:)`
        );
        await page.waitForSelector(
          `div[class="info-label"] ::-p-text(${listItemsLength} tests to view)`
        );
        await page.waitForSelector(`h2 ::-p-text(Instructions)`);
        await page.waitForSelector(`h2 ::-p-text(Record Results)`);
        await page.waitForSelector(`h3 ::-p-text(After)`);
      }

      expect(h1Text.includes('Test 1:')).toBe(true);
      expect(currentUrl.includes('/test-plan-report/19')).toBe(true);
      expect(listItemsLength).toBeGreaterThan(1);
    });
  });
});

describe('Test Run when signed in as tester', () => {
  const assignSelfAndNavigateToRun = async page => {
    const modalDialogSectionButtonSelector =
      'button#disclosure-btn-modal-dialog-0';
    const modalDialogTableSelector =
      'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';
    const startTestingButtonSelector =
      'a[role="button"] ::-p-text(Start Testing)';

    // Expand Modal Dialog's V24.06.07 section
    await page.waitForSelector(modalDialogSectionButtonSelector);
    await page.click(modalDialogSectionButtonSelector);

    // Wait for the table to render
    await page.waitForSelector(modalDialogTableSelector);

    await page.$eval(modalDialogTableSelector, el => {
      // First button found on table would be 'Assign Yourself'
      el.querySelector('button').click();
    });

    await page.waitForNetworkIdle();
    await page.waitForSelector('::-p-text(Unassign Yourself)');
    await page.waitForSelector(startTestingButtonSelector);
    await page.click(startTestingButtonSelector);

    // Wait for navigation to Test Run page to complete
    await page.waitForNavigation({
      waitUntil: ['domcontentloaded', 'networkidle0']
    });

    const atBrowserModalHeadingSelector =
      'h1 ::-p-text(Assistive Technology and Browser Details)';
    const atBrowserModalAtVersionSelectSelector =
      'select[data-testid="at-browser-modal-select"]';
    const atBrowserModalBrowserVersionInputSelector =
      'input[data-testid="at-browser-modal-input"][class="form-control"]';
    const atBrowserModalSaveButtonSelector =
      'button ::-p-text(Save and Continue)';

    await page.waitForSelector(atBrowserModalHeadingSelector);
    await page.select(atBrowserModalAtVersionSelectSelector, '2');
    await page.$eval(
      atBrowserModalBrowserVersionInputSelector,
      input => (input.value = '')
    );
    await page.type(
      atBrowserModalBrowserVersionInputSelector,
      '1.TestBrowserVersion'
    );
    await page.click(atBrowserModalSaveButtonSelector);
    await page.waitForNetworkIdle();
  };

  it('self assigns tester on Test Queue page and opens test run', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      const h1Text = await text(page, 'h1 ::-p-text(Test 1)');
      const currentUrl = await page.url();

      expect(h1Text.includes('Test 1:')).toBe(true);
      expect(currentUrl).toMatch(/^.*\/run\/\d+/);
    });
  });

  it('navigates between tests on /run/:id', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);
      await page.waitForSelector('h1 ::-p-text(Test 1)');

      const testNavigatorListSelector = 'nav#test-navigator-nav ol';
      await page.waitForSelector(testNavigatorListSelector);

      const listItemsLength = await page.$eval(
        testNavigatorListSelector,
        el => {
          return el.children.length;
        }
      );

      // Click each navigation item and confirm the h1 on page has changed
      for (let sequence = 1; sequence <= listItemsLength; sequence++) {
        // const sequence = i + 1;
        const liSelector = `nav#test-navigator-nav ol li:nth-child(${sequence})`;

        // Select the next test to navigate to
        await page.$eval(liSelector, el => el.querySelector('a').click());
        await page.waitForNetworkIdle();

        await page.waitForSelector(`h1 ::-p-text(Test ${sequence}:)`);
        await page.waitForSelector(
          `div[class="info-label"] ::-p-text(Test Plan:)`
        );
        await page.waitForSelector(`div[class="info-label"] ::-p-text(AT:)`);
        await page.waitForSelector(
          `div[class="info-label"] ::-p-text(Browser:)`
        );
        await page.waitForSelector(
          `div[class="info-label"] ::-p-text(0 of ${listItemsLength} tests completed)`
        );
        await page.waitForSelector(`h2 ::-p-text(Instructions)`);
        await page.waitForSelector(`h2 ::-p-text(Record Results)`);
        await page.waitForSelector(`h3 ::-p-text(After)`);
      }

      expect(listItemsLength).toBeGreaterThan(1);
    });
  });
});
