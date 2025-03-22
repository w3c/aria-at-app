import getPage from '../util/getPage';

describe('Report Rerun tab', () => {
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

        if (!table) return false;

        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return false;
        const firstRowMessage =
          rows[0].querySelector('.message-cell')?.textContent || '';
        return firstRowMessage.includes(
          'Created 1 re-run collection job for NVDA'
        );
      });
    });
  });
});
