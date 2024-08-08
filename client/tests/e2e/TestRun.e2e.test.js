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
    await getPage(
      { role: false, url: '/test-plan-report/19' },
      async (page, { consoleErrors }) => {
        const h1Text = await text(page, 'h1');
        expect(h1Text.includes('Test 1:')).toBe(true);

        const currentUrl = await page.url();

        await page.waitForSelector('nav#test-navigator-nav ol');
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
          // Randomly navigate using the navigation link or the next button
          if (Math.random())
            await li.evaluate(el => el.querySelector('a').click());
          else await page.click('button ::-p-text(Next Test)');

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

          const updatedUrl = await page.url();
          expect(updatedUrl).toMatch(
            new RegExp(`/test-plan-report/19#${index + 1}$`)
          );
        }

        expect(currentUrl.includes('/test-plan-report/19')).toBe(true);
        expect(listItemsLength).toBeGreaterThan(1);
        expect(consoleErrors).toHaveLength(0);
      }
    );
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

  it('navigates between tests', async () => {
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

  it('clamps the test index to the bounds of the test list', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');
      const url = await page.url();
      await page.goto(`${url}#0`);
      await page.waitForNetworkIdle();
      let h1Text = await text(page, 'h1');
      expect(h1Text).toMatch(/^Test 1:/);

      const numberOfTests = await page.$eval(
        'nav#test-navigator-nav ol',
        el => {
          return el.children.length;
        }
      );
      await page.goto(`${url}#${numberOfTests + 10}`);
      await page.waitForNetworkIdle();
      h1Text = await text(page, 'h1');
      expect(h1Text).toMatch(new RegExp(`Test ${numberOfTests}:`));
    });
  });

  it('inputs results and navigates between tests to confirm saving', async () => {
    async function getGeneratedCheckedTestCount(page, checkboxSelector) {
      return await page.$$eval(checkboxSelector, els => {
        let checkedCount = 0;
        const filteredCheckboxes = els.filter(
          checkbox => checkbox.id && !checkbox.id.includes('undesirable')
        );

        filteredCheckboxes.forEach((checkbox, index) => {
          // avoid checking the undesirable checkboxes which are conditionally
          // rendered
          const isChecked = index % 2 === 0;
          if (isChecked) {
            checkedCount++;
            checkbox.click();
          }
        });
        return checkedCount;
      });
    }

    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('button ::-p-text(Next Test)');

      const checkboxSelector = 'input[type="checkbox"]';
      const test1NavSelector = 'nav#test-navigator-nav ol li:nth-child(1)';
      const test2NavSelector = 'nav#test-navigator-nav ol li:nth-child(2)';
      const nextTestButtonSelector = 'button ::-p-text(Next Test)';
      const previousTestButtonSelector = 'button ::-p-text(Previous Test)';

      // Randomly check checkboxes on first test
      const generatedCheckedTest1Count = await getGeneratedCheckedTestCount(
        page,
        checkboxSelector
      );

      // Navigate to test 2 with navigation menu
      await page.$eval(test2NavSelector, el => el.querySelector('a').click());
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 2:)');
      await page.waitForSelector('button ::-p-text(Next Test)');
      const generatedCheckedTest2Count = await getGeneratedCheckedTestCount(
        page,
        checkboxSelector
      );

      // Navigate to test 3 with next button
      await page.click(nextTestButtonSelector);
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 3:)');
      await page.waitForSelector('button ::-p-text(Next Test)');
      const test3CheckedCount = await page.$$eval(
        checkboxSelector,
        els => els.filter(checkbox => checkbox.checked).length
      );

      // Navigate back to test 2 with previous button
      await page.click(previousTestButtonSelector);
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 2:)');
      await page.waitForSelector('button ::-p-text(Next Test)');
      const test2CheckedCount = await page.$$eval(
        checkboxSelector,
        els => els.filter(checkbox => checkbox.checked).length
      );

      // Navigate back to Test 1 with navigation menu
      await page.$eval(test1NavSelector, el => el.querySelector('a').click());
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 1:)');
      await page.waitForSelector('button ::-p-text(Next Test)');
      const test1CheckedCount = await page.$$eval(
        checkboxSelector,
        els =>
          els.filter(
            checkbox =>
              checkbox.id &&
              !checkbox.id.includes('undesirable') &&
              checkbox.checked
          ).length
      );

      expect(test1CheckedCount).toBe(generatedCheckedTest1Count);
      expect(test2CheckedCount).toBe(generatedCheckedTest2Count);
      expect(test3CheckedCount).toBe(0);
    });
  });

  it('inputs results and successfully submits', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');

      // Confirm that submission cannot happen with empty form
      // Specificity with selector because there's a 2nd 'hidden' button coming
      // from the harness which is what is actually called for the submit event
      const submitResultsButtonSelector =
        'button[class="btn btn-primary"] ::-p-text(Submit Results)';
      await page.waitForSelector(submitResultsButtonSelector);
      await page.click(submitResultsButtonSelector);
      await page.waitForNetworkIdle();
      await page.waitForSelector('::-p-text((required))');

      // Should refocus on topmost output textarea on page
      const activeElementAfterEmptySubmit = await page.evaluate(() => {
        return {
          id: document.activeElement.id,
          nodeName: document.activeElement.nodeName.toLowerCase()
        };
      });

      // Input output for valid submission
      await page.evaluate(() => {
        const checkboxEls = Array.from(
          document.querySelectorAll('input[type="checkbox"]')
        );
        const filteredCheckboxes = checkboxEls.filter(
          checkbox => checkbox.id && !checkbox.id.includes('undesirable')
        );

        filteredCheckboxes.forEach((checkbox, index) => {
          if (checkbox.id.includes('no-output-checkbox')) checkbox.click();
          else {
            // Selecting different assertions to force a conflict
            const check = index % 2 === 0;
            if (check) checkbox.click();
          }
        });

        const radioEls = Array.from(
          document.querySelectorAll('input[type="radio"]')
        );
        radioEls.forEach(radio => {
          if (radio.id && radio.id.includes('true')) radio.click();
        });
      });

      // Submit valid form
      await page.click(submitResultsButtonSelector);
      await page.waitForNetworkIdle();
      await page.waitForSelector(
        '::-p-text(This test has conflicting results)'
      );
      await page.waitForSelector('h2 ::-p-text(Test Results)');
      await page.waitForSelector('button ::-p-text(Edit Results)');

      expect(activeElementAfterEmptySubmit.id).toBe('speechoutput-0');
      expect(activeElementAfterEmptySubmit.nodeName).toBe('textarea');
    });
  });

  it('opens popup with content after clicking "Open Test Page" button', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      // Confirm open test page works
      const openTestPageButtonSelector = 'button ::-p-text(Open Test Page)';
      await page.click(openTestPageButtonSelector);

      const popupTarget = await new Promise(resolve =>
        page.browser().once('targetcreated', resolve)
      );

      // Allow additional time for popup to open
      const popupPage = await popupTarget.page();

      // Check for 'Run Test Setup' button
      await popupPage.waitForSelector('button ::-p-text(Run Test Setup)');
    });
  });
});
