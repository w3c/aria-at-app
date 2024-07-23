import getPage from '../util/getPage';
import { text } from './util';

describe('Test Review page', () => {
  const getReviewPageElements = async (
    page,
    browser,
    { isV2 = false } = {}
  ) => {
    await text(page, 'h2 ::-p-text(About This Test Plan)');
    await text(page, 'h2 ::-p-text(Supporting Documentation)');
    await text(page, 'h2 ::-p-text(Tests)');
    await text(page, '::-p-text(Filter tests by covered AT)');
    await text(page, 'button ::-p-text(All ATs)');
    await text(page, 'button ::-p-text(JAWS)');
    await text(page, 'button ::-p-text(NVDA)');
    await text(page, 'button ::-p-text(VoiceOver for macOS)');
    await text(page, 'h3 ::-p-text(Test 1:)');
    await text(page, 'h4 ::-p-text(JAWS)');
    await text(page, 'h4 ::-p-text(NVDA)');
    await text(page, 'h4 ::-p-text(VoiceOver for macOS)');
    await text(page, 'h5 ::-p-text(Instructions)');
    await text(page, 'h5 ::-p-text(Assertions)');
    await text(page, 'th ::-p-text(Priority)');
    await text(page, 'th ::-p-text(Assertion Statement)');
    if (isV2) {
      await text(page, '::-p-text(To perform a task with)');
      await text(page, 'th ::-p-text(Assertion Phrase)');
    }

    // Confirm open test page works
    const openTestPageButtonSelector = 'button ::-p-text(Open Test Page)';
    await page.waitForSelector(openTestPageButtonSelector);
    await page.click(openTestPageButtonSelector);

    const popupTarget = await new Promise(resolve =>
      browser.once('targetcreated', resolve)
    );
    const popupPage = await popupTarget.page();

    // Check for 'Run Test Setup' button
    await popupPage.waitForSelector('button ::-p-text(Run Test Setup)');
    await popupPage.close();
  };

  it('renders page for review page before test format v2', async () => {
    await getPage(
      { role: false, url: '/test-review/1' },
      async (page, { browser }) => {
        await text(
          page,
          'h1 ::-p-text(Alert Example Test Plan V22.04.14 (Deprecated))'
        );
        await getReviewPageElements(page, browser);
      }
    );
  });

  it('renders page for review page after test format v2', async () => {
    await getPage(
      { role: false, url: '/test-review/65' },
      async (page, { browser }) => {
        await text(
          page,
          'h1 ::-p-text(Alert Example Test Plan V23.12.06 (Deprecated))'
        );
        await getReviewPageElements(page, browser, { isV2: true });
      }
    );
  });

  it('opens latest review page for pattern from /data-management', async () => {
    await getPage(
      {
        role: false,
        url: '/data-management'
      },
      async (page, { browser }) => {
        await text(page, 'h1 ::-p-text(Data Management)');

        const latestAlertVersionLink = await page.evaluateHandle(() => {
          let rows = Array.from(document.querySelectorAll('tr'));
          for (let row of rows) {
            const thText = row.querySelector('th').textContent.trim();
            if (thText === 'Alert Example') {
              // Get the name of the latest Alert Example version from the 3rd
              // td, R&D Column, but also the 2nd possible link in the row
              return row.querySelectorAll('a')[1];
            }
          }
          return null;
        });

        // Capture version text name and navigate to review page
        const latestAlertVersionLinkText =
          await latestAlertVersionLink.evaluate(el => el.textContent.trim());
        await latestAlertVersionLink.click();
        await page.waitForNavigation({
          waitUntil: ['domcontentloaded', 'networkidle0']
        });

        await text(
          page,
          `h1 ::-p-text(Alert Example Test Plan ${latestAlertVersionLinkText})`
        );
        await getReviewPageElements(page, browser, { isV2: true });
      }
    );
  });
});
