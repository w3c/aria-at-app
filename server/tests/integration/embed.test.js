const embedApp = require('../../apps/embed');
const startSupertestServer = require('../util/api-server');
const db = require('../../models/index');
const applyJsdomGlobals = require('jsdom-global');
// Must be called before requiring the testing-library
applyJsdomGlobals('', { runScripts: 'dangerously' });
const { screen } = require('@testing-library/dom');
const fs = require('fs/promises');
const path = require('path');

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

const evaluateScripts = async () => {
    const scripts = Array.from(document.querySelectorAll('script'));
    if (
        scripts.length !== 1 ||
        scripts[0].getAttribute('src') !== '/embed/script.js'
    ) {
        throw new Error(
            'Test must be updated to support any additional scripts'
        );
    }
    const scriptText = await fs.readFile(
        path.resolve(__dirname, '../../handlebars/public/script.js'),
        { encoding: 'utf8' }
    );

    // const script = document.createElement('script');
    // script.innerHTML = scriptText;
    // document.body.append(script);
};

describe('embed', () => {
    it('renders support table with data', async () => {
        // Loads the iframe
        const res = await sessionAgent.get('/embed/reports/modal-dialog');

        // Enables the "screen" API of @testing-library/dom
        document.body.innerHTML = res.text;

        // @testing-library/dom does not find and execute client-side JS so it
        // must be evaluated manually
        await evaluateScripts();

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
        const viewReportButtonOnClick =
            viewReportButton.getAttribute('onclick');
        const copyEmbedButton = screen.getByText('Copy Embed Code');
        const copyEmbedButtonOnClick = copyEmbedButton.getAttribute('onclick');
        const table = document.querySelector('table');
        const cellWithData = Array.from(table.querySelectorAll('td')).find(td =>
            td.innerHTML.match(/<b>\s*\d+%<\/b>\s*supported/)
        );

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
            /announceCopied\('https?:\/\/[\w.:]+\/embed\/reports\/modal-dialog'\)/
        );
        expect(cellWithData).toBeTruthy();
    });
});
