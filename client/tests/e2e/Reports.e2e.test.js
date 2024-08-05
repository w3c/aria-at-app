import getPage from '../util/getPage';
import { text } from './util';

describe('Reports page', () => {
  it('renders reports page', async () => {
    await getPage({ role: false, url: '/reports' }, async page => {
      await page.waitForSelector(
        'h1 ::-p-text(Assistive Technology Interoperability Reports)'
      );
      await page.waitForSelector('h2 ::-p-text(Introduction)');
      await page.waitForSelector('h2 ::-p-text(Support Levels)');

      const tableRowsLength = await page.$eval(
        'table[aria-label="Support Levels"]',
        el => Array.from(el.rows).length
      );

      // Check that the currently 'required' reports combinations exist; these
      // combinations must exist in the table to be on this page
      await page.waitForSelector('th ::-p-text(Test Plan)');
      await page.waitForSelector('th ::-p-text(JAWS and Chrome)');
      await page.waitForSelector('th ::-p-text(NVDA and Chrome)');
      await page.waitForSelector(
        'th ::-p-text(VoiceOver for macOS and Safari)'
      );

      // There is more than just the thead row
      expect(tableRowsLength).toBeGreaterThan(1);
    });
  });
});

describe('Report page for recommended report', () => {
  const checkForHeading = async (page, selector, target) => {
    return page.$$eval(
      selector,
      (els, target) => {
        let regex;
        switch (target) {
          case 'jawsChrome':
            regex = /^JAWS\s+(.*?)\s+and\s+Chrome$/;
            break;
          case 'nvdaChrome':
            regex = /^NVDA\s+(.*?)\s+and\s+Chrome$/;
            break;
          case 'voiceoverSafari':
            regex = /^VoiceOver for macOS\s+(.*?)\s+and\s+Safari$/;
            break;
          default:
            break;
        }

        let found = false;
        for (let el of Array.from(els)) {
          const headingText = el.innerText.trim();
          if (regex.test(headingText)) {
            found = true;
            break;
          }
        }
        return found;
      },
      target
    );
  };

  it('renders page', async () => {
    await getPage({ role: false, url: '/report/67' }, async page => {
      await page.waitForSelector(
        'h1 ::-p-text(Checkbox Example (Mixed-State))'
      );
      await page.waitForSelector('h2 ::-p-text(Introduction)');
      await page.waitForSelector('h2 ::-p-text(Metadata)');
      await page.waitForSelector('details summary ::-p-text(Approved Report)');
      await page.waitForSelector(
        'a[role="button"] ::-p-text(View Complete Results)'
      );

      await page.waitForSelector('th ::-p-text(Test Name)');
      await page.waitForSelector('th ::-p-text(Must-Have Behaviors)');
      await page.waitForSelector('th ::-p-text(Should-Have Behaviors)');
      await page.waitForSelector('th ::-p-text(May-Have Behaviors)');

      // Check that the reported date is valid (format is MMM D, YYYY)
      const reportCompletedOnText = await text(
        page,
        '::-p-text(Report completed on)'
      );
      let validReportCompletedOnDate = false;
      const dateFormatRegex =
        /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/;
      const dateText = reportCompletedOnText.split('Report completed on ')[1];
      if (dateFormatRegex.test(dateText)) {
        // Confirm if date is valid
        const date = new Date(dateText);
        validReportCompletedOnDate = !isNaN(date.getTime());
      }

      // Check that '<AT> <AtVersion> + <Browser> headings are valid
      const validJawsHeadingMatchFound = await checkForHeading(
        page,
        'h2 ::-p-text(JAWS)',
        'jawsChrome'
      );
      const validNvdaHeadingMatchFound = await checkForHeading(
        page,
        'h2 ::-p-text(NVDA)',
        'nvdaChrome'
      );
      const validVoiceoverHeadingMatchFound = await checkForHeading(
        page,
        'h2 ::-p-text(VoiceOver for macOS)',
        'voiceoverSafari'
      );

      expect(validReportCompletedOnDate).toBe(true);
      expect(validJawsHeadingMatchFound).toBe(true);
      expect(validNvdaHeadingMatchFound).toBe(true);
      expect(validVoiceoverHeadingMatchFound).toBe(true);
    });
  });

  it('clicks View Results button and navigates to /targets/:id page', async () => {
    await getPage({ role: false, url: '/report/67' }, async page => {
      const viewResultsButton =
        'a[role="button"] ::-p-text(View Complete Results)';

      await page.waitForSelector(viewResultsButton);
      await page.click(viewResultsButton);

      await page.waitForSelector(
        'h1 ::-p-text(Checkbox Example (Mixed-State))'
      );
      await page.waitForSelector('h2 ::-p-text(Versions Summary)');
      await page.waitForSelector('h2 ::-p-text(Results for)');
      await page.waitForSelector('details summary ::-p-text(Approved Report)');
      const currentUrl = await page.url();

      expect(currentUrl).toMatch(/^.*\/report\/\d+\/targets\/\d+/);
    });
  });
});

describe('Report page for candidate report', () => {
  const checkForHeading = async (page, selector, headingText) => {
    return page.$$eval(
      selector,
      (els, headingText) =>
        Array.from(els)
          .map(el => el.innerText.trim())
          .includes(headingText),
      headingText
    );
  };

  it('renders page', async () => {
    await getPage({ role: false, url: '/report/24' }, async page => {
      await page.waitForSelector('h1 ::-p-text(Modal Dialog Example)');
      await page.waitForSelector('h2 ::-p-text(Introduction)');
      await page.waitForSelector('h2 ::-p-text(Metadata)');
      await page.waitForSelector(
        'details summary ::-p-text(Unapproved Report)'
      );
      await page.waitForSelector(
        'a[role="button"] ::-p-text(View Complete Results)'
      );

      await page.waitForSelector('th ::-p-text(Test Name)');
      await page.waitForSelector('th ::-p-text(Must-Have Behaviors)');
      await page.waitForSelector('th ::-p-text(Should-Have Behaviors)');
      await page.waitForSelector('th ::-p-text(May-Have Behaviors)');

      // Check that the reported date is valid (format is MMM D, YYYY)
      const reportCompletedOnText = await text(
        page,
        '::-p-text(Report completed on)'
      );
      let validReportCompletedOnDate = false;
      const dateFormatRegex =
        /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/;
      const dateText = reportCompletedOnText.split('Report completed on ')[1];
      if (dateFormatRegex.test(dateText)) {
        // Confirm if date is valid
        const date = new Date(dateText);
        validReportCompletedOnDate = !isNaN(date.getTime());
      }

      // Check that '<AT> <AtVersion> + <Browser> headings are valid
      const validJawsHeadingMatchFound = await checkForHeading(
        page,
        'h2 ::-p-text(JAWS)',
        'JAWS and Chrome'
      );
      const validNvdaHeadingMatchFound = await checkForHeading(
        page,
        'h2 ::-p-text(NVDA)',
        'NVDA and Chrome'
      );
      const validVoiceoverHeadingMatchFound = await checkForHeading(
        page,
        'h2 ::-p-text(VoiceOver for macOS)',
        'VoiceOver for macOS and Safari'
      );

      expect(validReportCompletedOnDate).toBe(true);
      expect(validJawsHeadingMatchFound).toBe(true);
      expect(validNvdaHeadingMatchFound).toBe(true);
      expect(validVoiceoverHeadingMatchFound).toBe(true);
    });
  });

  it('clicks View Results button and navigates to /targets/:id page', async () => {
    await getPage({ role: false, url: '/report/24' }, async page => {
      const viewResultsButton =
        'a[role="button"] ::-p-text(View Complete Results)';

      await page.waitForSelector(viewResultsButton);
      await page.click(viewResultsButton);

      await page.waitForSelector('h1 ::-p-text(Modal Dialog Example)');

      const isVersionsSummaryFound = await page.evaluate(() => {
        const elementsWithText = Array.from(
          document.querySelectorAll('h2')
        ).filter(element => element.textContent.includes('Versions Summary'));
        return elementsWithText.length > 0;
      });
      await page.waitForSelector('h2 ::-p-text(Results for)');
      await page.waitForSelector(
        'details summary ::-p-text(Unapproved Report)'
      );
      const currentUrl = await page.url();

      expect(isVersionsSummaryFound).toBe(false);
      expect(currentUrl).toMatch(/^.*\/report\/\d+\/targets\/\d+/);
    });
  });
});
