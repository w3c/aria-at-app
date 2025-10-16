import getPage from '../util/getPage';
import { text } from './util';

describe('Test Run when not signed in', () => {
  it('renders /run/:id page but unable to make changes', async () => {
    await getPage(
      { role: false, url: '/run/19' },
      async (page, { baseUrl }) => {
        await page.waitForSelector('h1 ::-p-text(Test 1:)');
        await page.waitForSelector('button[disabled] ::-p-text(Edit Results)');

        // Go to another pre-populated run with a form that hasn't yet been submitted
        await page.goto(`${baseUrl}/run/3#8`);
        await page.waitForSelector('h1 ::-p-text(Test 8:)');

        // Check that assertion output cannot be changed
        const textareaSelector = 'textarea';
        const originalTextAreaValue = await page.$eval(
          textareaSelector,
          el => el.value
        );
        await page.focus(textareaSelector);
        await page.keyboard.type('test sample input');
        const newTextAreaValue = await page.$eval(
          textareaSelector,
          el => el.value
        );

        // Check that assertion radio buttons cannot be changed
        const yesAssertionRadioSelector = 'input[type="radio"]#pass-0-0-yes';
        const noAssertionRadioSelector = 'input[type="radio"]#pass-0-0-no';
        const isYesAssertionCheckedBefore = await page.$eval(
          yesAssertionRadioSelector,
          el => el.checked
        );
        // Then compare with the other being checked to see if the values have changed after any action is taken
        if (isYesAssertionCheckedBefore) {
          await page.click(noAssertionRadioSelector);
        } else {
          await page.click(yesAssertionRadioSelector);
        }
        const isYesAssertionCheckedAfter = await page.$eval(
          yesAssertionRadioSelector,
          el => el.checked
        );

        expect(originalTextAreaValue).toEqual(newTextAreaValue);
        expect(isYesAssertionCheckedBefore).toEqual(isYesAssertionCheckedAfter);
      }
    );
  });

  it('renders /test-plan-report/:id and can navigate between tests', async () => {
    // This should be NVDA + Chrome + Modal Dialog Example with 12 tests
    await getPage(
      { role: false, url: '/test-plan-report/19' },
      async (page, { consoleErrors }) => {
        const h1Text = await text(page, 'h1');
        expect(h1Text.includes('Test 1:')).toBe(true);

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
            `div[data-testid="info-label"] ::-p-text(Test Plan:)`
          );
          await page.waitForSelector(
            `div[data-testid="info-label"] ::-p-text(AT:)`
          );
          await page.waitForSelector(
            `div[data-testid="info-label"] ::-p-text(Browser:)`
          );
          await page.waitForSelector(
            `div[data-testid="info-label"] ::-p-text(${listItemsLength} tests to view)`
          );
          await page.waitForSelector(`h2 ::-p-text(Instructions)`);
          await page.waitForSelector(`h2 ::-p-text(Record Results)`);
          await page.waitForSelector(`h3 ::-p-text(After)`);

          const updatedUrl = await page.url();
          expect(updatedUrl).toMatch(
            new RegExp(`/test-plan-report/19#${index + 1}$`)
          );
        }
        expect(consoleErrors).toHaveLength(0);
      }
    );
  });
});

describe('Test Run when signed in as admin', () => {
  const navigateToRunAsTester = async (
    page,
    {
      testPlanSectionButtonSelector = 'button#disclosure-btn-modal-dialog-0',
      testPlanTableSelector = 'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]'
    } = {}
  ) => {
    // Expand Modal Dialog's V24.06.07 section
    await page.waitForSelector(testPlanSectionButtonSelector);
    await page.click(testPlanSectionButtonSelector);

    // Wait for the table to render
    await page.waitForSelector(testPlanTableSelector);

    // Find the 'Open run as...' dropdown button from the Actions Column
    await page.evaluate(() => {
      const modalDialogTableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';
      const modalDialogTable = document.querySelector(modalDialogTableSelector);

      // Find the 'Open run as...' button from the Actions Column
      const cells = Array.from(modalDialogTable.querySelectorAll('td'));
      const actionsColumn = cells[4];
      const openRunAsDropdownButton = actionsColumn.querySelector(
        'div.dropdown button'
      );
      openRunAsDropdownButton.click();
    });

    // Wait for the dropdown menu to appear and click the tester's name
    const openRunAsMenuSelector = 'div.dropdown-menu';
    await page.waitForSelector(openRunAsMenuSelector);

    await page.evaluate(() => {
      const openRunAsMenu = document.querySelector('div.dropdown-menu');
      const testerOptions = Array.from(
        openRunAsMenu.querySelectorAll('a.dropdown-item')
      );
      const targetTesterOption = testerOptions.find(option =>
        option.innerText.includes('esmeralda-baggins')
      );
      targetTesterOption.click();
    });

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
    await page.waitForSelector(
      '::-p-text(Your version of Chrome has been updated to 1.TestBrowserVersion)'
    );
  };

  it('reassigns run to different tester then verifies tester assignment history is viewable', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      // Open run as tester, esmeralda-baggins
      await navigateToRunAsTester(page);

      // Wait for the page to be fully rendered with all data
      await page.waitForSelector('h1 ::-p-text(Test 1)');

      // Find the reassign dropdown button in the Test Options section
      await page.evaluate(() => {
        const reassignDropdownButton = document.querySelector(
          'button[aria-label="Reassign Testers"]'
        );
        if (reassignDropdownButton) {
          reassignDropdownButton.click();
        }
      });

      // Wait for the dropdown menu to appear
      const assignTestersMenuSelector = 'div [role="menu"]';
      await page.waitForSelector(assignTestersMenuSelector);

      // Find and click the target tester in the dropdown
      await page.evaluate(() => {
        const assignTestersMenuSelector = 'div [role="menu"]';
        const assignTestersMenu = document.querySelector(
          assignTestersMenuSelector
        );
        const assignTesterOptions = Array.from(
          assignTestersMenu.querySelectorAll('[role="menuitemcheckbox"]')
        );
        const targetTesterOption = assignTesterOptions.find(option =>
          option.innerText.includes('foo-bar')
        );
        if (targetTesterOption) {
          targetTesterOption.click();
        }
      });

      await page.waitForSelector('::-p-text(Tester Assignment History)');
      const assignmentHistoryText = await page.evaluate(() => {
        const assignmentHistoryText = document.querySelector(
          '[class*="assignment-container"]'
        );
        return assignmentHistoryText?.innerText;
      });

      // Verify the history contains reassignment information
      expect(assignmentHistoryText).toContain('This run was reassigned from');
      expect(assignmentHistoryText).toContain("to 'foo-bar'");
      expect(assignmentHistoryText).toContain('Performed by: joe-the-admin');
    });
  });

  it('deletes a test run as admin from the test run page', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      // Open run as tester, esmeralda-baggins
      await navigateToRunAsTester(page);

      // Wait for the page to be fully rendered with all data
      await page.waitForSelector('h1 ::-p-text(Test 1)');

      // Find and click the Delete Run button
      await page.waitForSelector('button ::-p-text(Delete Run)');
      await page.click('button ::-p-text(Delete Run)');

      // Wait for confirmation modal to appear
      await page.waitForSelector('::-p-text(Deleting Run)');
      await page.waitForSelector(
        '::-p-text(Are you sure you want to permanently delete)'
      );
      await page.waitForSelector('::-p-text(This cannot be undone)');
      await page.waitForSelector('button ::-p-text(Proceed)');
      await page.waitForSelector('button ::-p-text(Cancel)');

      // Proceed with deletion and complete navigation to the test queue
      await page.click('button ::-p-text(Proceed)');
      await page.waitForNavigation({
        waitUntil: ['domcontentloaded', 'networkidle0']
      });

      // Verify we're back on the test queue page
      await page.waitForSelector('h1 ::-p-text(Test Queue)');
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/\/test-queue$/);
    });
  });
});

describe('Test Run when signed in as tester', () => {
  const submitResultsButtonSelector =
    'button[class="btn btn-primary"] ::-p-text(Submit Results)';

  const assignSelfAndNavigateToRun = async (
    page,
    {
      testPlanSectionButtonSelector = 'button#disclosure-btn-modal-dialog-0',
      testPlanTableSelector = 'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]'
    } = {}
  ) => {
    const startTestingButtonSelector =
      'a[role="button"] ::-p-text(Start Testing)';

    // Expand Modal Dialog's V24.06.07 section
    await page.waitForSelector(testPlanSectionButtonSelector);
    await page.click(testPlanSectionButtonSelector);

    // Wait for the table to render
    await page.waitForSelector(testPlanTableSelector);

    await page.$eval(testPlanTableSelector, el => {
      // Find the 'Assign Yourself' button
      const buttons = el.querySelectorAll('button');
      const assignYourselfButton = Array.from(buttons).find(button =>
        button.textContent.includes('Assign Yourself')
      );
      assignYourselfButton.click();
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

  const navigateToRunAsAnotherTester = async (
    page,
    {
      testPlanSectionButtonSelector = 'button#disclosure-btn-modal-dialog-0',
      testPlanTableSelector = 'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]'
    } = {}
  ) => {
    // Expand Modal Dialog's V24.06.07 section
    await page.waitForSelector(testPlanSectionButtonSelector);
    await page.click(testPlanSectionButtonSelector);

    // Wait for the table to render
    await page.waitForSelector(testPlanTableSelector);

    // Find the 'View Results for...' dropdown button from the Actions Column
    await page.evaluate(() => {
      const modalDialogTableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';
      const modalDialogTable = document.querySelector(modalDialogTableSelector);

      // Find the 'View Results for...' button from the Actions Column
      const cells = Array.from(modalDialogTable.querySelectorAll('td'));
      const actionsColumn = cells[4];
      const viewResultsDropdownButton = actionsColumn.querySelector(
        'div.dropdown button'
      );
      viewResultsDropdownButton.click();
    });

    // Wait for the dropdown menu to appear and click the tester's name
    const viewResultsMenuSelector = 'div.dropdown-menu';
    await page.waitForSelector(viewResultsMenuSelector);

    await page.evaluate(() => {
      const openRunAsMenu = document.querySelector('div.dropdown-menu');
      const testerOptions = Array.from(
        openRunAsMenu.querySelectorAll('a.dropdown-item')
      );
      const targetTesterOption = testerOptions.find(option =>
        option.innerText.includes('esmeralda-baggins')
      );
      targetTesterOption.click();
    });

    // Wait for navigation to Test Run page to complete
    await page.waitForNavigation({
      waitUntil: ['domcontentloaded', 'networkidle0']
    });
    await page.waitForSelector(
      '::-p-text(tests of esmeralda-baggins in read-only mode)'
    );
  };

  const handlePageSubmit = async (page, { expectConflicts = true } = {}) => {
    await page.waitForSelector('h1 ::-p-text(Test 1)');

    // Confirm that submission cannot happen with empty form
    // Specificity with selector because there's a 2nd 'hidden' button coming
    // from the harness which is what is actually called for the submit event
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
      const yesRadios = document.querySelectorAll(
        'input[data-testid^="radio-yes-"]'
      );
      const noRadios = document.querySelectorAll(
        'input[data-testid^="radio-no-"]'
      );
      const noUndesiredRadios = document.querySelectorAll(
        'input[id^="problem-"][id$="-true"]'
      );
      const noOutputCheckboxes = document.querySelectorAll(
        'input[id^="no-output-checkbox"]'
      );

      yesRadios.forEach((radio, index) => {
        if (index % 2 === 0) {
          radio.click();
        } else {
          noRadios[index].click();
        }
      });

      noUndesiredRadios.forEach(radio => {
        radio.click();
      });

      noOutputCheckboxes.forEach(checkbox => {
        checkbox.click();
      });
    });
    // Submit valid form
    await page.click(submitResultsButtonSelector);
    await page.waitForNetworkIdle();
    if (expectConflicts)
      await page.waitForSelector(
        '::-p-text(This test has conflicting results)'
      );
    await page.waitForSelector('h2 ::-p-text(Test Results)');
    await page.waitForSelector('button ::-p-text(Edit Results)');

    expect(activeElementAfterEmptySubmit.id).toBe('speechoutput-0');
    expect(activeElementAfterEmptySubmit.nodeName).toBe('textarea');
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
          `div[data-testid="info-label"] ::-p-text(Test Plan:)`
        );
        await page.waitForSelector(
          `div[data-testid="info-label"] ::-p-text(AT:)`
        );
        await page.waitForSelector(
          `div[data-testid="info-label"] ::-p-text(Browser:)`
        );
        await page.waitForSelector(
          `div[data-testid="info-label"] ::-p-text(0 of ${listItemsLength} tests completed)`
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

  async function getGeneratedCheckedAssertionCount(page) {
    return await page.evaluate(() => {
      const radioGroups = document.querySelectorAll(
        'input[type="radio"][id^="pass-"]'
      );
      let yesCount = 0;

      for (let i = 0; i < radioGroups.length; i += 2) {
        if (i % 4 === 0) {
          radioGroups[i].click(); // Click 'Yes' radio
          yesCount++;
        } else {
          radioGroups[i + 1].click(); // Click 'No' radio
        }
      }

      return yesCount;
    });
  }

  it('inputs results and navigates between tests to confirm saving', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('button ::-p-text(Next Test)');

      const radioSelector = 'input[type="radio"][id^="pass-"]';
      const test1NavSelector = 'nav#test-navigator-nav ol li:nth-child(1)';
      const test2NavSelector = 'nav#test-navigator-nav ol li:nth-child(2)';
      const nextTestButtonSelector = 'button ::-p-text(Next Test)';
      const previousTestButtonSelector = 'button ::-p-text(Previous Test)';

      // Randomly select radio buttons on first test
      const generatedCheckedTest1Count =
        await getGeneratedCheckedAssertionCount(page);

      // Navigate to test 2 with navigation menu
      await page.$eval(test2NavSelector, el => el.querySelector('a').click());
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 2:)');
      await page.waitForSelector('button ::-p-text(Next Test)');
      const generatedCheckedTest2Count =
        await getGeneratedCheckedAssertionCount(page);

      // Navigate to test 3 with next button
      await page.click(nextTestButtonSelector);
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 3:)');
      await page.waitForSelector('button ::-p-text(Next Test)');
      const test3CheckedCount = await page.$$eval(
        radioSelector,
        els => els.filter(radio => radio.checked).length
      );

      // Navigate back to test 2 with previous button
      await page.click(previousTestButtonSelector);
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 2:)');
      await page.waitForSelector('button ::-p-text(Next Test)');
      const test2CheckedCount = await page.$$eval(
        radioSelector,
        els => els.filter(radio => radio.checked).length
      );

      // Navigate back to Test 1 with navigation menu
      await page.$eval(test1NavSelector, el => el.querySelector('a').click());
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 1:)');
      await page.waitForSelector('button ::-p-text(Next Test)');
      const test1CheckedCount = await page.$$eval(
        radioSelector,
        els =>
          els.filter(radio => radio.checked && radio.id.includes('-yes')).length
      );

      expect(test1CheckedCount).toBe(generatedCheckedTest1Count);
      expect(test2CheckedCount).toBe(generatedCheckedTest2Count * 2); // Both 'Yes' and 'No' are checked
      expect(test3CheckedCount).toBe(0);
    });
  });

  it('persists the presence of negative side effects', async () => {
    const countChecked = page => {
      return page.evaluate(() => {
        return Array.from(document.querySelectorAll('input[id^=problem-]')).map(
          el => el.checked
        );
      });
    };
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page, {
        testPlanSectionButtonSelector: 'button#disclosure-btn-alert-0',
        testPlanTableSelector:
          'table[aria-label="Reports for Alert Example V22.04.14 in draft phase"]'
      });

      await page.waitForSelector('h1 ::-p-text(Test 1:)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      expect(await countChecked(page)).toEqual([
        false,
        false,
        false,
        false,
        false,
        false
      ]);

      await page.evaluate(() => {
        document.querySelector('#problem-1-true').click();
        document.querySelector('#problem-2-false').click();
      });

      expect(await countChecked(page)).toEqual([
        false,
        false,
        true,
        false,
        false,
        true
      ]);

      await page.click(
        'button[class="btn btn-primary"] ::-p-text(Submit Results)'
      );

      await page.waitForSelector('h1 ::-p-text(Test 1:)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      expect(await countChecked(page)).toEqual([
        false,
        false,
        true,
        false,
        false,
        true
      ]);
    });
  });

  it('marks assertions as untestable', async () => {
    const countChecked = page => {
      return page.evaluate(() => {
        return {
          passing: document.querySelectorAll(
            '[type="radio"][id$=-yes]:not(:disabled):checked'
          ).length,
          failing: document.querySelectorAll(
            '[type="radio"][id$=-no]:not(:disabled):checked'
          ).length
        };
      });
    };
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page, {
        testPlanSectionButtonSelector: 'button#disclosure-btn-alert-0',
        testPlanTableSelector:
          'table[aria-label="Reports for Alert Example V22.04.14 in draft phase"]'
      });

      await page.waitForSelector('h1 ::-p-text(Test 1:)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      expect(await countChecked(page)).toEqual({
        passing: 0,
        failing: 0
      });

      await getGeneratedCheckedAssertionCount(page);

      expect(await countChecked(page)).toEqual({
        passing: 3,
        failing: 3
      });

      await page.click('label ::-p-text(Command is untestable)');

      expect(await countChecked(page)).toEqual({
        passing: 2,
        failing: 2
      });

      // The initial submission should fail because no SEVERE unexpected
      // behaviors have been specified.
      await page.click(submitResultsButtonSelector);
      await page.waitForNetworkIdle();
      await page.waitForSelector('h1 ::-p-text(Test 1:)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      await page.click('label ::-p-text(excessively verbose)');
      await page.select('.negative-side-effects-label select', 'SEVERE');
      await page.type(
        '.negative-side-effects-label input[type=text]',
        'anything'
      );

      await handlePageSubmit(page, { expectConflicts: false });

      const text = await page.evaluate(() => {
        // Scrape text and normalize empty space characters.
        const text = el => el.innerText.replace(/\s/g, ' ');
        const readTable = el => {
          return Array.from(el.querySelectorAll('tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => text(td))
          );
        };
        return [text(document.querySelector('main h2'))].concat(
          Array.from(document.querySelectorAll('main h3, main tbody')).map(el =>
            el.tagName === 'H3' ? text(el) : readTable(el)
          )
        );
      });

      expect(text).toEqual([
        'Test Results (7 passed, 3 failed, 0 unsupported, 2 untestable)',
        'Control+Option+Space Results: 1 passed, 1 failed, 2 untestable',
        [
          ['MUST', "Role 'alert' is conveyed", 'Untestable'],
          ['MUST', "Text 'Hello' is conveyed", 'Untestable'],
          ['MUST', 'Not cause severe negative side effects', 'Failed'],
          ['SHOULD', 'Not cause moderate negative side effects', 'Passed']
        ],
        'Negative side effects of Control+Option+Space',
        [
          [
            'Output is excessively verbose, e.g., includes redundant and/or irrelevant speech',
            'anything',
            'SEVERE'
          ]
        ],
        'Space Results: 3 passed, 1 failed, 0 unsupported',
        [
          ['MUST', "Text 'Hello' is conveyed", 'Failed'],
          ['MUST', "Role 'alert' is conveyed", 'Passed'],
          ['MUST', 'Not cause severe negative side effects', 'Passed'],
          ['SHOULD', 'Not cause moderate negative side effects', 'Passed']
        ],
        'Enter Results: 3 passed, 1 failed, 0 unsupported',
        [
          ['MUST', "Text 'Hello' is conveyed", 'Failed'],
          ['MUST', "Role 'alert' is conveyed", 'Passed'],
          ['MUST', 'Not cause severe negative side effects', 'Passed'],
          ['SHOULD', 'Not cause moderate negative side effects', 'Passed']
        ]
      ]);
    });
  });

  it('inputs results and successfully submits', async () => {
    await getPage(
      { role: 'tester', url: '/test-queue' },
      async (page, { baseUrl }) => {
        await assignSelfAndNavigateToRun(page);
        await handlePageSubmit(page);

        // Do the same for Color Viewer Slider which has specially handled
        // exclusions;
        // Excluded in tests.csv and re-included in *-commands.csv
        await page.goto(`${baseUrl}/test-queue`);
        await assignSelfAndNavigateToRun(page, {
          testPlanSectionButtonSelector:
            'button#disclosure-btn-horizontal-slider-0',
          testPlanTableSelector:
            'table[aria-label="Reports for Color Viewer Slider V24.12.04 in draft phase"]'
        });
        await handlePageSubmit(page, { expectConflicts: false });
      }
    );
  });

  it('opens popup with content after clicking "Open Test Page" button', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      // Confirm open test page works
      const openTestPageButtonSelector = 'button ::-p-text(Open Test Page)';
      await page.click(openTestPageButtonSelector);

      // Allow additional time for popup to open
      await page.waitForNetworkIdle();

      const pages = await global.browser.pages();
      const popupPage = pages[pages.length - 1];

      // Check for 'Run Test Setup' button
      await popupPage.waitForSelector('button ::-p-text(Run Test Setup)');
    });
  });

  it('enforces read-only and shows on-hold modal when report is On hold', async () => {
    // Ensure the report is On hold as admin first, then switch to tester in same page
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const sectionButtonSelector = 'button#disclosure-btn-modal-dialog-0';
      const tableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';

      await page.waitForSelector(sectionButtonSelector);
      await page.click(sectionButtonSelector);
      await page.waitForSelector(tableSelector);

      // Toggle to On hold if not already
      const toggleWasClicked = await page.$eval(tableSelector, el => {
        const firstRow = el.querySelector('tbody tr');
        const actionsCell = firstRow.querySelectorAll('td')[4];
        const btn = Array.from(actionsCell.querySelectorAll('button')).find(b =>
          /Put on hold|Ready for testing/i.test(b.innerText)
        );
        if (!btn) return false;
        const isOnHold = /Ready for testing/i.test(btn.innerText);
        if (!isOnHold) {
          btn.click();
          return true;
        }
        return false;
      });
      if (toggleWasClicked) await page.waitForNetworkIdle();

      // Verify status shows On hold
      const statusText = await page.$eval(tableSelector, el => {
        const firstRow = el.querySelector('tbody tr');
        const statusCell = firstRow.querySelectorAll('td')[3];
        return statusCell.innerText;
      });
      expect(statusText.includes('On hold')).toBe(true);

      // Sign in as tester within same session/transaction
      await page.evaluate('signMeInAsTester("joe-the-tester")');
      await page.waitForSelector('::-p-text(Signed in)');

      // Expand and assign self
      await page.waitForSelector(sectionButtonSelector);
      await page.click(sectionButtonSelector);
      await page.waitForSelector(tableSelector);
      await page.$eval(tableSelector, el => {
        // First button is Assign Yourself
        el.querySelector('button').click();
      });
      await page.waitForNetworkIdle();
      await page.waitForSelector('::-p-text(Unassign Yourself)');

      // Start testing
      await page.waitForSelector('a[role="button"] ::-p-text(Start Testing)');
      await page.click('a[role="button"] ::-p-text(Start Testing)');
      await page.waitForNavigation({
        waitUntil: ['domcontentloaded', 'networkidle0']
      });

      // Wait for Test Run to render
      await page.waitForSelector('h1 ::-p-text(Test 1:)');

      // On hold modal should be visible
      await page.waitForSelector('::-p-text(On hold)');

      // Submit button should be disabled
      await page.waitForSelector('button ::-p-text(Submit Results)');
      const submitDisabled = await page.$eval(
        'button[class="btn btn-primary"] ::-p-text(Submit Results)',
        el => el.closest('button').disabled
      );
      expect(submitDisabled).toBe(true);

      // Start Over should be disabled
      const startOverDisabled = await page.$eval(
        'button ::-p-text(Start Over)',
        el => el.closest('button').disabled
      );
      expect(startOverDisabled).toBe(true);

      // Close label should be present (not Save and Close)
      await page.waitForSelector('button ::-p-text(Close)');
      const hasSaveAndClose = await page.$('button ::-p-text(Save and Close)');
      expect(hasSaveAndClose).toBeNull();
    });
  });

  it('focuses first assertion radio button when only top output is filled', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      // Fill only the first speech output textarea
      const firstOutputTextareaSelector = 'textarea#speechoutput-0';
      await page.waitForSelector(firstOutputTextareaSelector);
      await page.type(firstOutputTextareaSelector, 'Test output content');

      // Submit without filling any assertion radio buttons
      await page.click(submitResultsButtonSelector);
      await page.waitForNetworkIdle();

      // Wait for the form to be re-rendered after submission
      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      // Check that the first assertion radio button is focused
      const activeElement = await page.evaluate(() => {
        return {
          dataTestId: document.activeElement.getAttribute('data-testid'),
          nodeName: document.activeElement.nodeName.toLowerCase(),
          type: document.activeElement.type
        };
      });

      expect(activeElement.dataTestId).toBe('radio-yes-0-0');
      expect(activeElement.nodeName).toBe('input');
      expect(activeElement.type).toBe('radio');
    });
  });

  it('focuses negative side effect details field when details are required but not provided', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      // Fill required fields to get past initial validation
      await page.evaluate(() => {
        const yesRadios = document.querySelectorAll(
          'input[data-testid^="radio-yes-"]'
        );
        const noOutputCheckboxes = document.querySelectorAll(
          'input[id^="no-output-checkbox"]'
        );

        yesRadios.forEach(radio => radio.click());
        noOutputCheckboxes.forEach(checkbox => checkbox.click());
      });

      // First enable negative side effects by clicking "Yes, negative side effects occurred"
      await page.evaluate(() => {
        const yesUndesiredRadios = document.querySelectorAll(
          'input[id^="problem-"][id$="-false"]'
        );
        // Click the first "Yes" radio for negative side effects
        if (yesUndesiredRadios.length > 0) {
          yesUndesiredRadios[0].click();
        }
      });

      // Select an negative side effect but don't fill details
      await page.click('label ::-p-text(excessively verbose)');

      // Submit the form
      await page.click(submitResultsButtonSelector);
      await page.waitForNetworkIdle();

      // Wait for the form to be re-rendered after submission
      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      // Check that the details input field is focused
      const activeElement = await page.evaluate(() => {
        return {
          className: document.activeElement.className,
          nodeName: document.activeElement.nodeName.toLowerCase(),
          type: document.activeElement.type
        };
      });

      expect(activeElement.nodeName).toBe('input');
      expect(activeElement.type).toBe('text');
      expect(activeElement.className).toContain(
        'negative-side-effect-output-is-excessively-verbose'
      );
    });
  });

  it('focuses first negative side effects radio button when required but not provided', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      // Fill all required fields except negative side effects
      await page.evaluate(() => {
        const yesRadios = document.querySelectorAll(
          'input[data-testid^="radio-yes-"]'
        );
        const noOutputCheckboxes = document.querySelectorAll(
          'input[id^="no-output-checkbox"]'
        );

        yesRadios.forEach(radio => radio.click());
        noOutputCheckboxes.forEach(checkbox => checkbox.click());
      });

      // Submit without selecting negative side effects option
      await page.click(submitResultsButtonSelector);
      await page.waitForNetworkIdle();

      // Wait for the form to be re-rendered after submission
      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('button ::-p-text(Submit Results)');

      // Check that the first negative side effects radio button is focused
      const activeElement = await page.evaluate(() => {
        return {
          id: document.activeElement.id,
          nodeName: document.activeElement.nodeName.toLowerCase(),
          type: document.activeElement.type
        };
      });

      expect(activeElement.id).toBe('problem-0-true');
      expect(activeElement.nodeName).toBe('input');
      expect(activeElement.type).toBe('radio');
    });
  });

  it('shows delete run button for self', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await assignSelfAndNavigateToRun(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');

      const deleteRunButton = await page.$('button ::-p-text(Delete Run)');
      expect(deleteRunButton).toBeDefined();
    });
  });

  it('does not show delete run button when viewing other tester run', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      // Open a run as another tester using the 'View Results for' button on the test queue page
      await navigateToRunAsAnotherTester(page);

      await page.waitForSelector('h1 ::-p-text(Test 1)');
      await page.waitForSelector('::-p-text(Test Options)');

      const deleteRunButton = await page.$('button ::-p-text(Delete Run)');
      expect(deleteRunButton).toBeNull();
    });
  });
});
