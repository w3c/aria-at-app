import getPage from '../util/getPage';
import { text, display } from './util';

describe('Test Queue common traits', () => {
  it('renders page h1', async () => {
    await getPage({ role: false, url: '/test-queue' }, async page => {
      const h1Element = await text(page, 'h1');
      expect(h1Element).toBe('Test Queue');
    });
  });
});

describe('Test Queue admin traits when reports exist', () => {
  const getVoRowFromTestPlanReportStatusDialog = async page => {
    return await page.evaluateHandle(() => {
      let rows = Array.from(document.querySelectorAll('.modal-body table tr'));
      for (let row of rows) {
        let rowHasVoiceOver,
          rowHasSafari = false;
        for (const cell of Array.from(row.querySelectorAll('td'))) {
          if (rowHasVoiceOver && rowHasSafari) break;
          if (cell.innerText.includes('VoiceOver for macOS'))
            rowHasVoiceOver = true;
          if (cell.innerText.includes('Safari')) rowHasSafari = true;
        }
        if (rowHasVoiceOver && rowHasSafari) return row;
      }
      return null;
    });
  };

  it('renders page h1', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const h1Element = await text(page, 'h1');
      expect(h1Element).toBe('Test Queue');
    });
  });

  it('renders page with instructions', async () => {
    await getPage(
      { role: 'admin', url: '/test-queue' },
      async (page, { consoleErrors }) => {
        const instructionsSelector = '[data-testid="test-queue-instructions"]';
        const instructionsText = await text(page, instructionsSelector);

        expect(instructionsText).toBe(
          'Manage the test plans, assign yourself a test plan or start executing one that is already assigned to you.'
        );

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });

  it('renders page with known pattern sections', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const alertSectionHeaderSelector = 'h2 ::-p-text(Alert Example)';
      const alertSectionContainerSelector =
        'div#disclosure-btn-controls-alert-0';
      const modalDialogSectionHeaderSelector =
        'h2 ::-p-text(Modal Dialog Example)';
      const modalDialogSectionContainerSelector =
        'div#disclosure-btn-controls-modal-dialog-0';

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
        'div#disclosure-btn-controls-modal-dialog-0';
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
        const progressPattern = /\d+\/\d+ responses, \d+\/\d+ verdicts/;
        const testersColumnCondition =
          testersColumnText.includes('Assign Testers') && // sr-only label applied to the assign testers dropdown component
          testersColumnText.includes('Assign Yourself') &&
          testersColumnText.includes('esmeralda-baggins') &&
          progressPattern.test(testersColumnText);

        // Status Column
        const statusColumn = cells[3];
        const statusColumnText = sanitizedText(statusColumn.innerText);
        const statusColumnCondition = statusColumnText.includes(
          '100% complete by esmeralda-baggins'
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

  it("renders page, opens pattern section's table and creates report using test plan report status dialog", async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const modalDialogSectionButtonSelector =
        'button#disclosure-btn-modal-dialog-0';
      const modalDialogRequiredReportsButtonSelector =
        'div#disclosure-btn-controls-modal-dialog-0 div.metadata-container button.test-plan-report-status-dialog-button';
      const modalDialogTableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';

      await page.waitForSelector(modalDialogSectionButtonSelector);

      // Expand Modal Dialog's V24.06.07 section
      await page.click(modalDialogSectionButtonSelector);

      // Wait for the table to render
      await page.waitForSelector(modalDialogTableSelector);

      await page.waitForSelector(modalDialogRequiredReportsButtonSelector);
      await page.click(modalDialogRequiredReportsButtonSelector);

      await page.waitForSelector('.modal-title ::-p-text(Report Status for)');

      // Get required VoiceOver row
      const voRowBeforeAddToQueue =
        await getVoRowFromTestPlanReportStatusDialog(page);
      const addButtonToTestQueueHandle = await voRowBeforeAddToQueue
        .asElement()
        .$('button[data-testid="add-button"]');

      await addButtonToTestQueueHandle.click();
      await page.waitForNetworkIdle();

      // The modal which pops up for the assigning an automation bot on report creation
      await page.click('button[data-testid="add-run-later"]');
      await page.waitForNetworkIdle();

      const voRowAfterAddToQueue = await getVoRowFromTestPlanReportStatusDialog(
        page
      );

      // Get values from cells in required VO row
      const [minimumAtVersionCellText, reportStatusCellText] =
        await voRowAfterAddToQueue.evaluate(el => {
          const atCell = el.querySelectorAll('td')[1]; // Assistive Technology is 2nd column
          const reportStatusCell = el.querySelectorAll('td')[3]; // Report Status is 4th column
          return [atCell.innerText, reportStatusCell.innerText];
        });

      expect(
        minimumAtVersionCellText.includes('VoiceOver for macOS') &&
          minimumAtVersionCellText.includes('11.6 (20G165) or later')
      ).toBe(true);
      expect(
        reportStatusCellText.includes('In test queue with no testers assigned')
      ).toBe(true);
    });
  });

  it("renders page, opens pattern section's table and creates report using test plan report status dialog after updating minimum AT version", async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const modalDialogSectionButtonSelector =
        'button#disclosure-btn-modal-dialog-0';
      const modalDialogRequiredReportsButtonSelector =
        'div#disclosure-btn-controls-modal-dialog-0 div.metadata-container button.test-plan-report-status-dialog-button';
      const modalDialogTableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';

      await page.waitForSelector(modalDialogSectionButtonSelector);

      // Expand Modal Dialog's V24.06.07 section
      await page.click(modalDialogSectionButtonSelector);

      // Wait for the table to render
      await page.waitForSelector(modalDialogTableSelector);

      await page.waitForSelector(modalDialogRequiredReportsButtonSelector);
      await page.click(modalDialogRequiredReportsButtonSelector);

      await page.waitForSelector('.modal-title ::-p-text(Report Status for)');

      // Get required VoiceOver row
      const voRowBeforeSelectChange =
        await getVoRowFromTestPlanReportStatusDialog(page);
      const atVersionSelectHandle = await voRowBeforeSelectChange
        .asElement()
        .$('select.minimum-at-version-select');

      await page.evaluate(select => {
        // Set to VoiceOver 14.0 (At.id is 6 from sample data). Default At.id was 3 (VoiceOver 11.6 (20G165))
        select.value = '6';
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }, atVersionSelectHandle);

      // Refetch row, since DOM may have changed from React re-render
      const voRowAfterSelectChange =
        await getVoRowFromTestPlanReportStatusDialog(page);
      const addButtonToTestQueueHandle = await voRowAfterSelectChange
        .asElement()
        .$('button[data-testid="add-button"]');

      await addButtonToTestQueueHandle.click();
      await page.waitForNetworkIdle();

      // The modal which pops up for the assigning an automation bot on report creation
      await page.click('button[data-testid="add-run-later"]');
      await page.waitForNetworkIdle();

      const voRowAfterAddToQueue = await getVoRowFromTestPlanReportStatusDialog(
        page
      );

      // Get values from cells in required VO row
      const [minimumAtVersionCellText, reportStatusCellText] =
        await voRowAfterAddToQueue.evaluate(el => {
          const atCell = el.querySelectorAll('td')[1]; // Assistive Technology is 2nd column
          const reportStatusCell = el.querySelectorAll('td')[3]; // Report Status is 4th column
          return [atCell.innerText, reportStatusCell.innerText];
        });

      expect(
        minimumAtVersionCellText.includes('VoiceOver for macOS') &&
          minimumAtVersionCellText.includes('14.0 or later')
      ).toBe(true);
      expect(
        reportStatusCellText.includes('In test queue with no testers assigned')
      ).toBe(true);
    });
  });

  it('allows admin to toggle On hold and shows pill in Status', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      const sectionButtonSelector = 'button#disclosure-btn-modal-dialog-0';
      const tableSelector =
        'table[aria-label="Reports for Modal Dialog Example V24.06.07 in draft phase"]';

      await page.waitForSelector(sectionButtonSelector);
      await page.click(sectionButtonSelector);
      await page.waitForSelector(tableSelector);

      // Work with first row in the table body
      const selectors = await page.$eval(tableSelector, el => {
        const firstRow = el.querySelector('tbody tr');
        const cells = firstRow.querySelectorAll('td');
        return {
          statusCellText: cells[3].innerText,
          actionsCellSelector: 'tbody tr td:nth-child(5)'
        };
      });

      // Ensure not on hold initially
      expect(selectors.statusCellText.includes('On hold')).toBe(false);

      // Click the toggle to put on hold
      await page.$eval(
        `${tableSelector} ${selectors.actionsCellSelector}`,
        el => {
          const btn = Array.from(el.querySelectorAll('button')).find(b =>
            /Put on hold/i.test(b.innerText)
          );
          if (btn) btn.click();
        }
      );

      await page.waitForNetworkIdle();

      // Verify pill and button label
      const [statusTextAfter, toggleLabelAfter] = await page.$eval(
        tableSelector,
        el => {
          const firstRow = el.querySelector('tbody tr');
          const cells = firstRow.querySelectorAll('td');
          const statusText = cells[3].innerText;
          const actionsCell = cells[4];
          const btn = Array.from(actionsCell.querySelectorAll('button')).find(
            b => /Ready for testing|Put on hold/i.test(b.innerText)
          );
          return [statusText, btn ? btn.innerText : ''];
        }
      );

      expect(statusTextAfter.includes('On hold')).toBe(true);
      expect(/Ready for testing/i.test(toggleLabelAfter)).toBe(true);

      // Toggle back to ready
      await page.$eval(tableSelector, el => {
        const firstRow = el.querySelector('tbody tr');
        const actionsCell = firstRow.querySelectorAll('td')[4];
        const btn = Array.from(actionsCell.querySelectorAll('button')).find(b =>
          /Ready for testing/i.test(b.innerText)
        );
        if (btn) btn.click();
      });
      await page.waitForNetworkIdle();

      const statusTextFinal = await page.$eval(tableSelector, el => {
        const firstRow = el.querySelector('tbody tr');
        const cells = firstRow.querySelectorAll('td');
        return cells[3].innerText;
      });

      expect(statusTextFinal.includes('On hold')).toBe(false);
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
      const alertSectionContainerSelector =
        'div#disclosure-btn-controls-alert-0';
      const modalDialogSectionHeaderSelector =
        'h2 ::-p-text(Modal Dialog Example)';
      const modalDialogSectionContainerSelector =
        'div#disclosure-btn-controls-modal-dialog-0';

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
        'div#disclosure-btn-controls-modal-dialog-0';
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
        const progressPattern = /\d+\/\d+ responses, \d+\/\d+ verdicts/;
        const testersColumnCondition =
          !testersColumnText.includes('Assign Testers') && // doesn't show unless admin
          testersColumnText.includes('Assign Yourself') &&
          testersColumnText.includes('esmeralda-baggins') &&
          progressPattern.test(testersColumnText);

        // Status Column
        const statusColumn = cells[3];
        const statusColumnText = sanitizedText(statusColumn.innerText);
        const statusColumnCondition = statusColumnText.includes(
          '100% complete by esmeralda-baggins'
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
