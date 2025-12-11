import getPage from '../util/getPage';
import { text } from './util';

describe('Reports page', () => {
  it('renders reports page', async () => {
    await getPage(
      { role: false, url: '/reports' },
      async (page, { consoleErrors }) => {
        await page.waitForSelector(
          'h1 ::-p-text(Assistive Technology Interoperability Reports)'
        );

        // Check that tabs exist
        await page.waitForSelector('button ::-p-text(Test Plans)');
        await page.waitForSelector('button ::-p-text(ARIA Features)');
        await page.waitForSelector('button ::-p-text(HTML Features)');

        // Check Test Plans tab content (default tab)
        await page.waitForSelector('h2 ::-p-text(Test Plan Support Levels)');
        const testPlansTableRowsLength = await page.$eval(
          'table[aria-label="Test Plan Support Levels"]',
          el => Array.from(el.rows).length
        );
        expect(testPlansTableRowsLength).toBeGreaterThan(1);

        // Click ARIA Features tab
        await page.click('button ::-p-text(ARIA Features)');
        await page.waitForSelector('h2 ::-p-text(ARIA Feature Support Levels)');

        // Check for ARIA features in table
        await page.waitForSelector('th ::-p-text(ARIA Feature)');
        await page.waitForSelector(
          'th ::-p-text(VoiceOver for macOS and Safari)'
        );
        await page.waitForSelector('th ::-p-text(JAWS and Chrome)');
        await page.waitForSelector('th ::-p-text(NVDA and Chrome)');

        // Check for some key ARIA features
        await page.waitForSelector('td ::-p-text(aria-activedescendant)');
        await page.waitForSelector('td ::-p-text(aria-expanded)');
        await page.waitForSelector('td ::-p-text(aria-haspopup)');

        // Click HTML Features tab
        await page.click('button ::-p-text(HTML Features)');
        await page.waitForSelector('h2 ::-p-text(HTML Feature Support Levels)');

        // Check for HTML features in table
        await page.waitForSelector('th ::-p-text(HTML Feature)');
        await page.waitForSelector('td ::-p-text(button)');

        expect(consoleErrors).toHaveLength(0);
      }
    );
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
        'JAWS 2021.2111.13 or later and Chrome'
      );
      const validNvdaHeadingMatchFound = await checkForHeading(
        page,
        'h2 ::-p-text(NVDA)',
        'NVDA 2020.4 or later and Chrome'
      );
      const validVoiceoverHeadingMatchFound = await checkForHeading(
        page,
        'h2 ::-p-text(VoiceOver for macOS)',
        'VoiceOver for macOS 11.6 (20G165) or later and Safari'
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
      await page.waitForSelector('h2 ::-p-text(Versions Summary)');
      await page.waitForSelector('h2 ::-p-text(Results for)');
      await page.waitForSelector(
        'details summary ::-p-text(Unapproved Report)'
      );
      const currentUrl = await page.url();

      expect(currentUrl).toMatch(/^.*\/report\/\d+\/targets\/\d+/);
    });
  });
});

describe('ARIA Feature detail report page', () => {
  it('renders ARIA feature report', async () => {
    await getPage(
      { role: false, url: '/aria-html-feature/3/3/aria-expanded' },
      async (page, { consoleErrors }) => {
        await page.waitForSelector(
          'h1 ::-p-text(VoiceOver for macOS and Safari Support for)'
        );
        await page.waitForSelector(
          'a ::-p-text(aria-expanded ARIA Specification)'
        );

        await page.waitForSelector('nav[aria-label="Breadcrumb"]');
        await page.waitForSelector('a ::-p-text(AT Interoperability Reports)');

        await page.waitForSelector(
          'h2 ::-p-text(Summary of Results for VoiceOver for macOS and Safari)'
        );

        await page.waitForSelector(
          'table[aria-label="Assertion Statistics Summary"]'
        );
        await page.waitForSelector('th ::-p-text(Passing)');
        await page.waitForSelector('th ::-p-text(Failing)');
        await page.waitForSelector('th ::-p-text(Untestable)');
        await page.waitForSelector('td ::-p-text(Should-Have Behaviors)');

        await page.waitForSelector('a[download] ::-p-text(Download CSV)');

        await page.waitForSelector('h2 ::-p-text(Raw Data)');
        await page.waitForSelector('table[aria-label="Raw assertion data"]');
        await page.waitForSelector('th ::-p-text(Test Plan Report)');
        await page.waitForSelector('th ::-p-text(Test)');
        await page.waitForSelector('th ::-p-text(Command)');
        await page.waitForSelector('th ::-p-text(Assertion Priority)');
        await page.waitForSelector('th ::-p-text(Assertion Phrase)');
        await page.waitForSelector('th ::-p-text(Result)');

        await page.waitForSelector(
          'td ::-p-text(Action Menu Button Example Using aria-activedescendant)'
        );
        await page.waitForSelector('td ::-p-text(Activate a menu item)');
        await page.waitForSelector('td ::-p-text(Control+Option+Space)');

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });

  it('can download CSV for ARIA feature report', async () => {
    await getPage(
      { role: false, url: '/aria-html-feature/3/3/aria-expanded' },
      async page => {
        const downloadButton = 'a[download] ::-p-text(Download CSV)';
        await page.waitForSelector(downloadButton);

        const downloadLink = await page.$eval(downloadButton, el => el.href);

        expect(downloadLink).toContain(
          '/api/metrics/aria-html-features/details.csv'
        );
        expect(downloadLink).toContain('refId=aria-expanded');
      }
    );
  });
});

describe('HTML Feature detail report page', () => {
  it('renders HTML feature report', async () => {
    await getPage(
      { role: false, url: '/aria-html-feature/3/2/button' },
      async (page, { consoleErrors }) => {
        await page.waitForSelector(
          'h1 ::-p-text(VoiceOver for macOS and Chrome Support for)'
        );
        await page.waitForSelector(
          'a ::-p-text(button HTML-AAM Specification)'
        );

        await page.waitForSelector('nav[aria-label="Breadcrumb"]');
        await page.waitForSelector('a ::-p-text(AT Interoperability Reports)');

        await page.waitForSelector(
          'h2 ::-p-text(Summary of Results for VoiceOver for macOS and Chrome)'
        );

        await page.waitForSelector(
          'table[aria-label="Assertion Statistics Summary"]'
        );
        await page.waitForSelector('th ::-p-text(Passing)');
        await page.waitForSelector('th ::-p-text(Failing)');
        await page.waitForSelector('th ::-p-text(Untestable)');
        await page.waitForSelector('td ::-p-text(Should-Have Behaviors)');

        await page.waitForSelector('a[download] ::-p-text(Download CSV)');

        await page.waitForSelector('h2 ::-p-text(Raw Data)');
        await page.waitForSelector('table[aria-label="Raw assertion data"]');
        await page.waitForSelector('th ::-p-text(Test Plan Report)');
        await page.waitForSelector('th ::-p-text(Test)');
        await page.waitForSelector('th ::-p-text(Command)');
        await page.waitForSelector('th ::-p-text(Assertion Priority)');

        await page.waitForSelector(
          'td ::-p-text(Action Menu Button Example Using aria-activedescendant)'
        );
        await page.waitForSelector('td ::-p-text(Activate a menu item)');

        expect(consoleErrors).toHaveLength(0);
      }
    );
  });

  it('can download CSV for HTML feature report', async () => {
    await getPage(
      { role: false, url: '/aria-html-feature/3/2/button' },
      async page => {
        const downloadButton = 'a[download] ::-p-text(Download CSV)';
        await page.waitForSelector(downloadButton);

        const downloadLink = await page.$eval(downloadButton, el => el.href);

        expect(downloadLink).toContain(
          '/api/metrics/aria-html-features/details.csv'
        );
        expect(downloadLink).toContain('refId=button');
      }
    );
  });
});
