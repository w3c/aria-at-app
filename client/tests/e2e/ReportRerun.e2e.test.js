import getPage from '../util/getPage';

describe('Report Rerun tab', () => {
  jest.setTimeout(60000);

  const switchToReportRerunTab = async page => {
    await page.waitForSelector(
      'button[role="tab"] span::-p-text(Automated Report Updates)'
    );
    await page.click(
      'button[role="tab"] span::-p-text(Automated Report Updates)'
    );
    await page.waitForSelector('[role="tabpanel"]:not([hidden])');
  };

  it('shows different content based on user role', async () => {
    await getPage({ role: 'tester', url: '/test-queue' }, async page => {
      await switchToReportRerunTab(page);

      const rerunDashboardExists = await page.evaluate(() => {
        return document.querySelector('.rerun-dashboard') !== null;
      });
      expect(rerunDashboardExists).toBe(false);
    });

    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      await switchToReportRerunTab(page);

      const rerunOpportunities = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.rerun-opportunity')).map(
          el => ({
            botName: el.querySelector('.bot-name').textContent,
            hasStartButton: el.querySelector('.rerun-button') !== null
          })
        );
      });

      expect(rerunOpportunities.length).toBeGreaterThan(0);
      rerunOpportunities.forEach(opportunity => {
        expect(opportunity.botName).toBeTruthy();
        expect(opportunity.hasStartButton).toBe(true);
      });
    });
  });

  it('displays update events table', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      await switchToReportRerunTab(page);

      // Verify the events table structure
      const tableStructure = await page.evaluate(() => {
        const table = document.querySelector(
          'table[aria-label="Test plan rerun events history"]'
        );
        if (!table) return null;

        const headers = Array.from(table.querySelectorAll('th')).map(
          th => th.textContent
        );
        const hasTimeColumn = headers.includes('Time');
        const hasMessageColumn = headers.includes('Message');

        return { hasTimeColumn, hasMessageColumn };
      });

      expect(tableStructure).toEqual({
        hasTimeColumn: true,
        hasMessageColumn: true
      });
    });
  });

  it('handles rerun action for specific bot version', async () => {
    await getPage({ role: 'admin', url: '/test-queue' }, async page => {
      await switchToReportRerunTab(page);

      const startUpdateResult = await page.evaluate(() => {
        const nvdaBot = Array.from(
          document.querySelectorAll('.rerun-opportunity')
        ).find(el =>
          el.querySelector('.bot-name').textContent.includes('NVDA Bot')
        );

        if (!nvdaBot) return { found: false };

        const button = nvdaBot.querySelector('.rerun-button');
        if (!button) return { found: false };

        const testPlanCount =
          nvdaBot.querySelector('.plan-count-number').textContent;
        button.click();

        return {
          found: true,
          testPlanCount
        };
      });

      expect(startUpdateResult.found).toBe(true);

      await page.waitForFunction(() => {
        const table = document.querySelector(
          'table[aria-label="Test plan rerun events history"]'
        );
        return (
          table && table.querySelector('tbody tr:nth-child(2) td.message-cell')
        );
      });
      const eventMessage = await page.$eval(
        'table[aria-label="Test plan rerun events history"] tbody tr:first-child td.message-cell',
        el => el.textContent
      );
      expect(eventMessage).toContain(
        'Created 1 re-run collection job for NVDA 2023.3.3'
      );
    });
  });
});
