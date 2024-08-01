import getPage from '../util/getPage';
import { text, display, checkConsoleErrors } from './util';

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
    await getPage({ role: 'vendor', url: '/candidate-review' }, async page => {
      const errors = await checkConsoleErrors(page, async () => {
        await page.waitForSelector('h1 ::-p-text(Candidate Review)');
      });

      expect(errors).toHaveLength(0);

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
      const tableDisclosureContainerSelector = 'div#expand-at-1';
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
    });
  });

  it('navigates to candidate test plan run page', async () => {
    await getPage({ role: 'vendor', url: '/candidate-review' }, async page => {
      await page.waitForSelector('h1 ::-p-text(Candidate Review)');

      // Select first possible link from the table in the Candidate Test Plans
      // column
      await page.click('table[aria-label] a');

      await page.waitForSelector('nav#test-navigator-nav ol');
      await page.waitForSelector('h1 ::-p-text(1.)');
      await page.waitForSelector('h1[class="current-test-title"]');

      // Expand Test Instructions and Test Results
      const instructionsDisclosureContainerSelector =
        '[id="disclosure-container-test-instructions-and-results-Test Instructions"]';
      const testResultsDisclosureContainerSelector =
        '[id^="disclosure-container-test-instructions-and-results-Test Results for"]';
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
});
