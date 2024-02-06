const puppeteer = require('puppeteer');
const path = require('path');
const spawn = require('cross-spawn');
const treeKill = require('tree-kill');

/*
End-to-End Testing TODO:
- The server start and close functions should be handled in one place by
Jest's setup and teardown scripts.
- There needs to be a utility function to enable common tasks like getting a
fresh end-to-end page.
- End-to-end testing should support signing in with different roles, A.K.A. as
an admin, tester or vendor.
- It should be possible to reset the database to a predictable state after each
test, ideally in such a way that concurrency remains possible. See the POC
here: https://github.com/w3c/aria-at-app/pull/895
*/

const PORT = 8033;
const CLIENT_PORT = 3033;
const AUTOMATION_SCHEDULER_PORT = 8833;

const startServer = async serverOrClient => {
    return new Promise(resolve => {
        const server = spawn('yarn', ['workspace', serverOrClient, 'dev'], {
            cwd: path.resolve(__dirname, '../../'),
            env: {
                PATH: process.env.PATH,
                PORT,
                CLIENT_PORT: 3033,
                AUTOMATION_SCHEDULER_PORT: 8833,
                API_SERVER: `http://localhost:${PORT}`,
                APP_SERVER: `http://localhost:${CLIENT_PORT}`,
                AUTOMATION_SCHEDULER_URL: `http://localhost:${AUTOMATION_SCHEDULER_PORT}`,
                PGDATABASE: 'aria_at_report_test',
                PGPORT: 5432,
                ENVIRONMENT: 'test'
            }
        });

        const killServer = async () => {
            await new Promise((resolve, reject) => {
                treeKill(server.pid, error => {
                    if (error) return reject(error);
                    resolve();
                });
            });
        };

        server.stdout.on('data', data => {
            const output = data.toString();
            console.info(output); // eslint-disable-line no-console

            if (
                (serverOrClient === 'server' &&
                    output.includes(`Listening on ${PORT}`)) ||
                (serverOrClient === 'client' &&
                    output.includes('compiled successfully'))
            ) {
                resolve({ close: killServer });
            }
        });

        server.stderr.on('data', data => {
            const output = data.toString();
            console.info(output); // eslint-disable-line no-console
        });
    });
};

describe('smoke test', () => {
    let browser;
    let backendServer;
    let clientServer;

    beforeAll(async () => {
        // eslint-disable-next-line no-console
        console.info(
            'Starting dev servers. This is required for end-to-end testing'
        );
        [clientServer, backendServer] = await Promise.all([
            startServer('client'),
            startServer('server')
        ]);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox'] // Required for GitHub environment
        });
        const [extraBlankPage] = await browser.pages();
        extraBlankPage.close();
    }, 60000);

    afterAll(async () => {
        await Promise.all([backendServer.close(), clientServer.close()]);

        // Browser might not be defined, if it failed to start
        if (browser) await browser.close();
    }, 60000);

    it('loads various pages without crashing', async () => {
        let homeH1;
        let reportsH1;
        let dataManagementH1;

        await Promise.all([
            (async () => {
                const page = await browser.newPage();
                await page.goto(`http://localhost:${CLIENT_PORT}/`);
                await page.waitForSelector('h1');
                const h1Handle = await page.waitForSelector('h1');
                homeH1 = await h1Handle.evaluate(h1 => h1.innerText);
            })(),
            (async () => {
                const page = await browser.newPage();
                await page.goto(`http://localhost:${CLIENT_PORT}/reports`);
                // Wait for an h2 because an h1 will show while the page is
                // still loading
                await page.waitForSelector('h2');
                const h1Handle = await page.waitForSelector('h1');
                reportsH1 = await h1Handle.evaluate(h1 => h1.innerText);
            })(),
            (async () => {
                const page = await browser.newPage();
                await page.goto(
                    `http://localhost:${CLIENT_PORT}/data-management`
                );
                // Wait for an h2 because an h1 will show while the page is
                // still loading
                await page.waitForSelector('h2');
                const h1Handle = await page.waitForSelector('h1');
                dataManagementH1 = await h1Handle.evaluate(h1 => h1.innerText);
            })()
        ]);

        expect(homeH1).toBe(
            'Enabling Interoperability for Assistive Technology Users'
        );
        expect(reportsH1).toBe('Assistive Technology Interoperability Reports');
        expect(dataManagementH1).toBe('Data Management');
    }, 60000);
});
