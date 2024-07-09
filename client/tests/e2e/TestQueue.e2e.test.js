import getPage from '../util/getPage';

const text = async (page, selector, { wait = true } = {}) => {
  if (wait) await page.waitForSelector(selector);
  return page.$eval(selector, el => el.innerText);
};

const display = async (page, selector, { wait = true } = {}) => {
  if (wait) await page.waitForSelector(selector);
  return page.$eval(selector, el => {
    const styles = window.getComputedStyle(el);
    return styles.getPropertyValue('display');
  });
};

describe('Test Queue common traits', () => {
  it('renders page h1', async () => {
    await getPage({ role: false, url: '/test-queue' }, async page => {
      const h1Element = await text(page, 'h1');
      expect(h1Element).toBe('Test Queue');
    });
  });
});

describe('Test Queue admin traits when reports exist', () => {
  it('renders page h1', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const h1Element = await text(page, 'h1');
      expect(h1Element).toBe('Test Queue');
    });
  });

  it('renders page with instructions', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const instructionsSelector = '[data-testid="test-queue-instructions"]';
      const instructionsText = await text(page, instructionsSelector);

      expect(instructionsText).toBe(
        'Manage the test plans, assign yourself a test plan or start executing one that is already assigned to you.'
      );
    });
  });

  it('renders page with known pattern sections', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const alertSectionHeaderSelector = 'h2 ::-p-text(Alert Example)';
      const alertSectionContainerSelector = 'div#disclosure-container-alert-0';
      const modalDialogSectionHeaderSelector =
        'h2 ::-p-text(Modal Dialog Example)';
      const modalDialogSectionContainerSelector =
        'div#disclosure-container-modal-dialog-0';

      const alertSectionTitle = await text(page, alertSectionHeaderSelector);
      const alertSectionDisplay = await display(
        page,
        alertSectionContainerSelector
      );
      const modalDialogSectionTitle = await text(
        page,
        modalDialogSectionHeaderSelector
      );
      const modalDialogSectionDisplay = await display(
        page,
        modalDialogSectionContainerSelector
      );

      expect(alertSectionTitle).toBe('Alert Example');
      expect(alertSectionDisplay).toBe('none');
      expect(modalDialogSectionTitle).toBe('Modal Dialog Example');
      expect(modalDialogSectionDisplay).toBe('none');
    });
  });

  it("renders page and open pattern section's table", async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const modalDialogSectionContainerSelector =
        'div#disclosure-container-modal-dialog-0';
      const modalDialogSectionButtonSelector =
        'button#disclosure-btn-modal-dialog-0';
      const modalDialogTableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';

      await page.waitForSelector(modalDialogSectionButtonSelector);

      const modalDialogSectionButton = await text(
        page,
        modalDialogSectionContainerSelector
      );
      const preClickModalDialogSectionDisplay = await display(
        page,
        modalDialogSectionContainerSelector
      );

      // Expand Modal Dialog's V24.06.07 section
      await page.click(modalDialogSectionButtonSelector);
      const postClickModalDialogSectionDisplay = await display(
        page,
        modalDialogSectionContainerSelector
      );

      // Wait for the table to render
      await page.waitForSelector(modalDialogTableSelector);

      // Check if the table contains expected column data
      const validTable = await page.$eval(modalDialogTableSelector, el => {
        const sanitizedText = text =>
          text
            .replaceAll(String.fromCharCode(160), ' ') // remove &nbsp; being included
            .trim();

        // Check if any cell in the table contains expected text
        const cells = Array.from(el.querySelectorAll('td'));

        // Assistive Technology Column
        const atColumn = cells[0];
        const atColumnText = sanitizedText(atColumn.innerText);
        const atColumnCondition = atColumnText.includes('NVDA 2020.4 or later');

        // Browser Column
        const browserColumn = cells[1];
        const browserColumnText = sanitizedText(browserColumn.innerText);
        const browserColumnCondition =
          browserColumnText.includes('Chrome Any version');

        // Testers Column
        const testersColumn = cells[2];
        const testersColumnText = sanitizedText(testersColumn.innerText);
        const testersColumnCondition =
          testersColumnText.includes('Assign Testers') && // sr-only label applied to the assign testers dropdown component
          testersColumnText.includes('Assign Yourself') &&
          testersColumnText.includes('esmeralda-baggins') &&
          testersColumnText.includes('tests complete');

        // Status Column
        const statusColumn = cells[3];
        const statusColumnText = sanitizedText(statusColumn.innerText);
        const statusColumnCondition = statusColumnText.includes(
          '100% complete by esmeralda-baggins with 0 conflicts'
        );

        // Actions Column
        const actionsColumn = cells[4];
        const actionsColumnText = sanitizedText(actionsColumn.innerText);
        const actionsColumnCondition =
          actionsColumnText.includes('Start Testing') &&
          actionsColumnText.includes('Open run as...') &&
          actionsColumnText.includes('Mark as Final') &&
          actionsColumnText.includes('Mark as Final');

        return (
          atColumnCondition &&
          browserColumnCondition &&
          testersColumnCondition &&
          statusColumnCondition &&
          actionsColumnCondition
        );
      });

      expect(modalDialogSectionButton.includes('V24.06.07')).toBe(true);
      expect(preClickModalDialogSectionDisplay).toBe('none');
      expect(postClickModalDialogSectionDisplay).toBe('block');
      expect(validTable).toBe(true);
    });
  });

  it("renders page, opens pattern section's table and assigns bot and shows context related action", async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const modalDialogSectionButtonSelector =
        'button#disclosure-btn-modal-dialog-0';
      const modalDialogTableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';

      await page.waitForSelector(modalDialogSectionButtonSelector);

      // Expand Modal Dialog's V24.06.07 section
      await page.click(modalDialogSectionButtonSelector);

      // Wait for the table to render
      await page.waitForSelector(modalDialogTableSelector);

      const assignTestersDropdownButton = await page.evaluateHandle(() => {
        const modalDialogTableSelector =
          'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';
        const modalDialogTable = document.querySelector(
          modalDialogTableSelector
        );

        // Check if any cell in the table contains expected text
        const cells = Array.from(modalDialogTable.querySelectorAll('td'));

        // Testers Column
        const testersColumn = cells[2];
        return testersColumn.querySelector('div.dropdown button');
      });

      await assignTestersDropdownButton.click();

      // Will be first option on page after clicking the dropdown button
      const assignTestersMenuSelector = 'div [role="menu"]';
      await page.waitForSelector(assignTestersMenuSelector);

      const assignBotOptionButton = await page.evaluateHandle(() => {
        const assignTestersMenuSelector = 'div [role="menu"]';
        const assignTestersMenu = document.querySelector(
          assignTestersMenuSelector
        );
        const assignTesterOptions = Array.from(
          assignTestersMenu.querySelectorAll('[role="menuitemcheckbox"]')
        );

        return assignTesterOptions.find(option =>
          option.innerText.includes('Bot')
        );
      });

      // Assign the bot user found in the assign testers list
      await assignBotOptionButton.click();
      await page.waitForSelector('::-p-text(Manage NVDA Bot Run)');

      // Check if the table contains expected column data
      const validTable = await page.$eval(modalDialogTableSelector, el => {
        const sanitizedText = text =>
          text
            .replaceAll(String.fromCharCode(160), ' ') // remove &nbsp; being included
            .trim();

        // Check if any cell in the table contains expected text
        const cells = Array.from(el.querySelectorAll('td'));

        // Actions Column
        const actionsColumn = cells[4];
        const actionsColumnText = sanitizedText(actionsColumn.innerText);
        return (
          actionsColumnText.includes('Start Testing') &&
          actionsColumnText.includes('Open run as...') &&
          actionsColumnText.includes('Mark as Final') &&
          actionsColumnText.includes('Mark as Final') &&
          actionsColumnText.includes('Manage NVDA Bot Run')
        );
      });

      expect(validTable).toBe(true);
    });
  });
});

describe('Test Queue tester traits when reports exist', () => {
  it('renders page h1', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      const h1Element = await text(page, 'h1');
      expect(h1Element).toBe('Test Queue');
    });
  });

  it('renders page with instructions', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      const instructionsSelector = '[data-testid="test-queue-instructions"]';
      const instructionsText = await text(page, instructionsSelector);

      expect(instructionsText).toBe(
        'Assign yourself a test plan or start executing one that is already assigned to you.'
      );
    });
  });

  it('renders page with known pattern sections', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      const alertSectionHeaderSelector = 'h2 ::-p-text(Alert Example)';
      const alertSectionContainerSelector = 'div#disclosure-container-alert-0';
      const modalDialogSectionHeaderSelector =
        'h2 ::-p-text(Modal Dialog Example)';
      const modalDialogSectionContainerSelector =
        'div#disclosure-container-modal-dialog-0';

      const alertSectionTitle = await text(page, alertSectionHeaderSelector);
      const alertSectionDisplay = await display(
        page,
        alertSectionContainerSelector
      );
      const modalDialogSectionTitle = await text(
        page,
        modalDialogSectionHeaderSelector
      );
      const modalDialogSectionDisplay = await display(
        page,
        modalDialogSectionContainerSelector
      );

      expect(alertSectionTitle).toBe('Alert Example');
      expect(alertSectionDisplay).toBe('none');
      expect(modalDialogSectionTitle).toBe('Modal Dialog Example');
      expect(modalDialogSectionDisplay).toBe('none');
    });
  });

  it("renders page and open pattern section's table", async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      const modalDialogSectionContainerSelector =
        'div#disclosure-container-modal-dialog-0';
      const modalDialogSectionButtonSelector =
        'button#disclosure-btn-modal-dialog-0';
      const modalDialogTableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';

      await page.waitForSelector(modalDialogSectionButtonSelector);

      const modalDialogSectionButton = await text(
        page,
        modalDialogSectionContainerSelector
      );
      const preClickModalDialogSectionDisplay = await display(
        page,
        modalDialogSectionContainerSelector
      );

      // Expand Modal Dialog's V24.06.07 section
      await page.click(modalDialogSectionButtonSelector);
      const postClickModalDialogSectionDisplay = await display(
        page,
        modalDialogSectionContainerSelector
      );

      // Wait for the table to render
      await page.waitForSelector(modalDialogTableSelector);

      // Check if the table contains expected column data
      const validTable = await page.$eval(modalDialogTableSelector, el => {
        const sanitizedText = text =>
          text
            .replaceAll(String.fromCharCode(160), ' ') // remove &nbsp; being included
            .trim();

        // Check if any cell in the table contains expected text
        const cells = Array.from(el.querySelectorAll('td'));

        // Assistive Technology Column
        const atColumn = cells[0];
        const atColumnText = sanitizedText(atColumn.innerText);
        const atColumnCondition = atColumnText.includes('NVDA 2020.4 or later');

        // Browser Column
        const browserColumn = cells[1];
        const browserColumnText = sanitizedText(browserColumn.innerText);
        const browserColumnCondition =
          browserColumnText.includes('Chrome Any version');

        // Testers Column
        const testersColumn = cells[2];
        const testersColumnText = sanitizedText(testersColumn.innerText);
        const testersColumnCondition =
          !testersColumnText.includes('Assign Testers') && // doesn't show unless admin
          testersColumnText.includes('Assign Yourself') &&
          testersColumnText.includes('esmeralda-baggins') &&
          testersColumnText.includes('tests complete');

        // Status Column
        const statusColumn = cells[3];
        const statusColumnText = sanitizedText(statusColumn.innerText);
        const statusColumnCondition = statusColumnText.includes(
          '100% complete by esmeralda-baggins with 0 conflicts'
        );

        // Actions Column
        const actionsColumn = cells[4];
        const actionsColumnText = sanitizedText(actionsColumn.innerText);
        const actionsColumnCondition =
          actionsColumnText.includes('Start Testing') &&
          !actionsColumnText.includes('Open run as...') &&
          !actionsColumnText.includes('Mark as Final') &&
          !actionsColumnText.includes('Mark as Final') &&
          !actionsColumnText.includes('Manage NVDA Bot Run');

        return (
          atColumnCondition &&
          browserColumnCondition &&
          testersColumnCondition &&
          statusColumnCondition &&
          actionsColumnCondition
        );
      });

      expect(modalDialogSectionButton.includes('V24.06.07')).toBe(true);
      expect(preClickModalDialogSectionDisplay).toBe('none');
      expect(postClickModalDialogSectionDisplay).toBe('block');
      expect(validTable).toBe(true);
    });
  });

  it("renders page, opens pattern section's table and assigns yourself and shows proper state of context related action", async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      const modalDialogSectionButtonSelector =
        'button#disclosure-btn-modal-dialog-0';
      const modalDialogTableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';

      await page.waitForSelector(modalDialogSectionButtonSelector);

      // Expand Modal Dialog's V24.06.07 section
      await page.click(modalDialogSectionButtonSelector);

      // Wait for the table to render
      await page.waitForSelector(modalDialogTableSelector);

      const preAssignValidTable = await page.$eval(
        modalDialogTableSelector,
        el => {
          const sanitizedText = text =>
            text
              .replaceAll(String.fromCharCode(160), ' ') // remove &nbsp; being included
              .trim();

          // Check if any cell in the table contains expected text
          const cells = Array.from(el.querySelectorAll('td'));

          // Actions Column
          const actionsColumn = cells[4];

          // Normal disabled button unless assigned
          const startTestingButton = actionsColumn.querySelector('button');
          const startTestingButtonText = sanitizedText(
            startTestingButton.innerText
          );
          const actionsColumnText = sanitizedText(actionsColumn.innerText);
          return (
            startTestingButton.disabled &&
            startTestingButtonText.includes('Start Testing') &&
            !actionsColumnText.includes('Open run as...') &&
            !actionsColumnText.includes('Mark as Final') &&
            !actionsColumnText.includes('Mark as Final') &&
            !actionsColumnText.includes('Manage NVDA Bot Run')
          );
        }
      );

      const assignYourselfButton = await page.evaluateHandle(() => {
        const modalDialogTableSelector =
          'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';
        const modalDialogTable = document.querySelector(
          modalDialogTableSelector
        );

        // Check if any cell in the table contains expected text
        const cells = Array.from(modalDialogTable.querySelectorAll('td'));

        // Testers Column
        const testersColumn = cells[2];

        // First button will be the 'Assign Yourself' button
        return testersColumn.querySelector('button');
      });

      // Assign yourself to the test plan report
      await assignYourselfButton.click();

      // Allow self assignment to happen
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if the table contains expected column data
      const postAssignValidTable = await page.$eval(
        modalDialogTableSelector,
        el => {
          const sanitizedText = text =>
            text
              .replaceAll(String.fromCharCode(160), ' ') // remove &nbsp; being included
              .trim();

          // Check if any cell in the table contains expected text
          const cells = Array.from(el.querySelectorAll('td'));

          // Actions Column
          const actionsColumn = cells[4];

          // The button gets converted to <a>
          const startTestingButton =
            actionsColumn.querySelector('a[role="button"]');
          const startTestingButtonText = sanitizedText(
            startTestingButton.innerText
          );
          const actionsColumnText = sanitizedText(actionsColumn.innerText);
          return (
            startTestingButton &&
            startTestingButtonText.includes('Start Testing') &&
            !actionsColumnText.includes('Open run as...') &&
            !actionsColumnText.includes('Mark as Final') &&
            !actionsColumnText.includes('Mark as Final') &&
            !actionsColumnText.includes('Manage NVDA Bot Run')
          );
        }
      );

      expect(preAssignValidTable).toBe(true);
      expect(postAssignValidTable).toBe(true);
    });
  });
});
