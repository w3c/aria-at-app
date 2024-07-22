const embedApp = require('../../apps/embed');
const startSupertestServer = require('../util/api-server');
const db = require('../../models/index');
const applyJsdomGlobals = require('jsdom-global');
// Must be called before requiring the testing-library
applyJsdomGlobals();
const { screen } = require('@testing-library/dom');

let apiServer;
let sessionAgent;

beforeAll(async () => {
  apiServer = await startSupertestServer({
    graphql: false,
    pathToRoutes: [['/embed', embedApp]]
  });
  sessionAgent = apiServer.sessionAgent;
});

afterAll(async () => {
  await apiServer.tearDown();
  // Closing the DB connection allows Jest to exit successfully.
  await db.sequelize.close();
});

describe('embed', () => {
  it('renders support table with data', async () => {
    // Load the iframe, twice, one with a normal load and a second time from
    // the cache
    const initialLoadTimeStart = Number(new Date());
    const res = await sessionAgent.get('/embed/reports/checkbox-tri-state');
    const initialLoadTimeEnd = Number(new Date());
    const initialLoadTime = initialLoadTimeEnd - initialLoadTimeStart;

    const cachedTimeStart = Number(new Date());
    const res2 = await sessionAgent.get('/embed/reports/checkbox-tri-state');
    const cachedTimeEnd = Number(new Date());
    const cachedTime = cachedTimeEnd - cachedTimeStart;

    // Enables the "screen" API of @testing-library/dom
    document.body.innerHTML = res.text;

    const nonWarning = screen.queryByText('Recommended Report');
    const warning = screen.queryByText('Warning! Unapproved Report');

    const nonWarningContents = screen.queryByText(
      'The information in this report is generated from candidate tests',
      { exact: false }
    );
    const warningContents = screen.queryByText(
      'The information in this report is generated from recommended tests',
      { exact: false }
    );
    const viewReportButton = screen.getByText('View Complete Report');
    const viewReportButtonOnClick = viewReportButton.getAttribute('onclick');
    const copyEmbedButton = screen.getByText('Copy Embed Code');
    const copyEmbedButtonOnClick = copyEmbedButton.getAttribute('onclick');
    const table = document.querySelector('table');
    const cellWithData = Array.from(table.querySelectorAll('td')).find(td =>
      td.innerHTML.match(/<b>\s*\d+%\s*<\/b>/)
    );

    expect(res.text).toEqual(res2.text);
    // Caching should speed up the load time by more than 10x
    expect(initialLoadTime / 10).toBeGreaterThan(cachedTime);
    expect(nonWarning || warning).toBeTruthy();
    expect(nonWarningContents || warningContents).toBeTruthy();
    expect(viewReportButton).toBeTruthy();
    expect(viewReportButtonOnClick).toMatch(
      // Onclick should be like the following:
      // window.open('https://127.0.0.1:59112/report/26', '_blank')
      /window\.open\('https?:\/\/[\w.:]+\/report\/\d+', '_blank'\)/
    );
    expect(copyEmbedButton).toBeTruthy();
    expect(copyEmbedButtonOnClick).toMatch(
      /announceCopied\('https?:\/\/[\w.:]+\/embed\/reports\/checkbox-tri-state'\)/
    );
    expect(cellWithData).toBeTruthy();
  });

  it('renders a failure message without a pattern', async () => {
    const res = await sessionAgent.get('/embed/reports/polka-dot-button');

    document.body.innerHTML = res.text;

    const failText = screen.queryByText('There is no data for this pattern.');

    expect(failText).toBeTruthy();
  });
});
