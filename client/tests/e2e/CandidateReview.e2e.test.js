import getPage from '../util/getPage';
import { text, display } from './util';

describe('Candidate Review when not signed in or tester', () => {
  it('does not render page if signed out', async () => {
    await getPage({ role: false, url: '/candidate-review' }, async page => {
      const h1Text = await text(page, 'h1');
      const currentUrl = await page.url();

      expect(h1Text).toBe('Whoops! Unable to complete request');
      expect(currentUrl.includes('/invalid-request')).toBe(true);
    });
  });

  it('does not render page if tester', async () => {
    await getPage({ role: 'tester', url: '/candidate-review' }, async page => {
      const h1Text = await text(page, 'h1');
      const currentUrl = await page.url();

      expect(h1Text).toBe('Whoops! Page not found');
      expect(currentUrl.includes('/404')).toBe(true);
    });
  });
});

describe('Candidate Review when signed in as vendor', () => {
  it('renders page if signed in', async () => {
    await getPage(
      { role: 'vendor', url: '/candidate-review' },
      async (page, { consoleErrors }) => {
        await page.waitForSelector('h1 ::-p-text(Candidate Review)');

        // Get section's disclosure titles
        await page.waitForSelector('h3 button ::-p-text(JAWS)');
        await page.waitForSelector('h3 button ::-p-text(NVDA)');
        await page.waitForSelector('h3 button ::-p-text(VoiceOver for macOS)');

        // Check for table headings
        await page.waitForSelector('th ::-p-text(Candidate Test Plans)');
        await page.waitForSelector('th ::-p-text(Last Updated)');
        await page.waitForSelector('th ::-p-text(Target Completion Date)');
        await page.waitForSelector('th ::-p-text(Review Status)');
        await page.waitForSelector('th ::-p-text(Results Summary)');

        await page.waitForSelector('h3 ::-p-text(Review Status Summary)');

        // Test disclosure collapse interaction
        const tableDisclosureContainerSelector =
          'div#disclosure-btn-controls-candidateReviewRuns-JAWS';
        const initialDisplayForTableDisclosureContainer = await display(
          page,
          tableDisclosureContainerSelector
        );
        await page.click('h3 button ::-p-text(JAWS)');
        const afterClickDisplayForTableDisclosureContainer = await display(
          page,
          tableDisclosureContainerSelector
        );

        expect(initialDisplayForTableDisclosureContainer).not.toBe('none');
        expect(afterClickDisplayForTableDisclosureContainer).toBe('none');

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });

  it('navigates to candidate test plan run page', async () => {
    await getPage({ role: 'vendor', url: '/candidate-review' }, async page => {
      await page.waitForSelector('h1 ::-p-text(Candidate Review)');

      // Select first possible link from the table in the Candidate Test Plans
      // column
      await page.click('table[aria-label] a');

      await page.waitForSelector('nav#test-navigator-nav ol');
      await page.waitForSelector('h1 ::-p-text(1.)');
      await page.waitForSelector('h1[data-testid="current-test-title"]');
      await page.waitForSelector(
        '::-p-text(Review status by JAWS Representative: In Progress)'
      );

      // Expand Test Instructions and Test Results
      const instructionsDisclosureContainerSelector =
        '[id="disclosure-btn-controls-candidateReviewRun-Test Instructions"]';
      const testResultsDisclosureContainerSelector =
        '[id^="disclosure-btn-controls-candidateReviewRun-Test Results for"]';
      const initialInstructionsDisclosureDisplay = await display(
        page,
        instructionsDisclosureContainerSelector
      );
      const initialTestResultDisclosureDisplay = await display(
        page,
        testResultsDisclosureContainerSelector
      );

      await page.click('button ::-p-text(Test Instructions)');
      await page.click('button ::-p-text(Test Results for)');

      const afterClickInstructionsDisclosureDisplay = await display(
        page,
        instructionsDisclosureContainerSelector
      );
      const afterClickTestResultDisclosureDisplay = await display(
        page,
        testResultsDisclosureContainerSelector
      );

      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/^.*\/candidate-test-plan\/\d+\/\d+/);
      expect(initialInstructionsDisclosureDisplay).toBe('none');
      expect(initialTestResultDisclosureDisplay).toBe('none');
      expect(afterClickInstructionsDisclosureDisplay).not.toBe('none');
      expect(afterClickTestResultDisclosureDisplay).not.toBe('none');
    });
  });

  it('shows summary view as first page and navigates correctly', async () => {
    await getPage(
      { role: 'vendor', url: '/candidate-review' },
      async (page, { consoleErrors }) => {
        await page.waitForSelector('h1 ::-p-text(Candidate Review)');

        // Select first possible link from the table in the Candidate Test Plans
        // column
        await page.click('table[aria-label] a');

        await page.waitForSelector('nav#test-navigator-nav ol');
        await page.waitForSelector('h1 ::-p-text(1.)');
        await page.waitForSelector('h1[data-testid="current-test-title"]');
        await page.waitForSelector(
          '::-p-text(Review status by JAWS Representative: In Progress)'
        );

        await page.click('a[href="#summary"]');

        // Check navigation buttons in summary view
        const previousButton = await page.$('button::-p-text(Previous Test)');
        expect(previousButton).toBeNull(); // No Previous button on summary

        const nextButton = await page.waitForSelector(
          'button::-p-text(Begin Review)'
        );
        await nextButton.click();

        // Should navigate to first test
        await page.waitForSelector('h1::-p-text(1.)');
        // Check summary link aria-current attribute
        const summaryLinkAriaCurrent = await page.$eval(
          'a[href="#summary"]',
          el => el.getAttribute('aria-current')
        );
        expect(summaryLinkAriaCurrent).toBe('false');

        // Previous button should go back to summary from first test
        const previousFromFirstTest = await page.waitForSelector(
          'button::-p-text(Summary)'
        );
        await previousFromFirstTest.click();

        // Should be back on summary
        await page.waitForSelector('a[href="#summary"][aria-current="true"]');

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });

  it('shows failing assertions summary content', async () => {
    await getPage(
      { role: 'vendor', url: '/candidate-review' },
      async (page, { consoleErrors }) => {
        await page.waitForSelector('h1 ::-p-text(Candidate Review)');

        // Select first possible link from the table in the Candidate Test Plans
        // column
        await page.click('table[aria-label] a');

        await page.waitForSelector('nav#test-navigator-nav ol');
        await page.waitForSelector('h1 ::-p-text(1.)');
        await page.waitForSelector('h1[data-testid="current-test-title"]');
        await page.waitForSelector(
          '::-p-text(Review status by JAWS Representative: In Progress)'
        );

        // Check for summary specific content
        await page.click('a[href="#summary"]');
        await page.waitForSelector(
          'h1::-p-text(Summary of Failing Assertions)'
        );

        // Check for table
        await page.waitForSelector(
          'table[aria-labelledby="failing-assertions-heading"]'
        );

        // Get the text from the first link in the table
        const firstLinkText = await page.$eval(
          'table[aria-labelledby="failing-assertions-heading"] a',
          el => el.textContent
        );

        // Click on the first link in the table
        await page.click(
          'table[aria-labelledby="failing-assertions-heading"] a'
        );

        // Ensure we are on the correct test
        await page.waitForSelector('nav#test-navigator-nav ol');

        // Check if the text from the first link in the table is in the h1
        // So that we know we are on the correct test
        const h1Text = await text(page, 'h1');
        expect(h1Text).toContain(firstLinkText);

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });
});
