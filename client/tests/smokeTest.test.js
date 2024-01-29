const puppeteer = require('puppeteer');
const path = require('path');
const spawn = require('cross-spawn');

const startServer = async serverOrClient => {
    return new Promise(resolve => {
        const server = spawn('yarn', ['workspace', serverOrClient, 'dev'], {
            cwd: path.resolve(__dirname, '../../'),
            env: {
                PATH: process.env.PATH,
                PORT: 8033,
                CLIENT_PORT: 3033,
                AUTOMATION_SCHEDULER_PORT: 8833,
                API_SERVER: 'http://localhost:8033',
                APP_SERVER: 'http://localhost:3033',
                AUTOMATION_SCHEDULER_URL: 'http://localhost:8833',
                PGDATABASE: 'aria_at_report_test',
                PGPORT: 5432,
                ENVIRONMENT: 'test'
            }
        });

        const killServer = async () => {
            server.kill();
            // It's currently difficult to know when the server has
            // terminated, but it takes around 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));
        };

        server.stdout.on('data', data => {
            const output = data.toString();
            console.info(output); // eslint-disable-line no-console

            if (
                (serverOrClient === 'server' &&
                    output.includes('Listening on 8033')) ||
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
        console.log('hi 1');
        [clientServer, backendServer] = await Promise.all([
            startServer('client'),
            startServer('server')
        ]);
        console.log('hi 2');

        browser = await puppeteer.launch({ headless: 'new' });
        console.log('hi 3');
        const [extraBlankPage] = await browser.pages();
        console.log('hi 4');
        extraBlankPage.close();
        console.log('hi 5');
    }, 60000);

    afterAll(async () => {
        if (!browser) return; // Failed to start

        await browser.close();

        await Promise.all([backendServer.close(), clientServer.close()]);
    }, 60000);

    it('loads various pages without crashing', async () => {
        let homeH1;
        let reportsH1;
        let dataManagementH1;

        await Promise.all([
            (async () => {
                const page = await browser.newPage();
                await page.goto('http://localhost:3033/');
                await page.waitForSelector('h1');
                const h1Handle = await page.waitForSelector('h1');
                homeH1 = await h1Handle.evaluate(h1 => h1.innerText);
            })(),
            (async () => {
                const page = await browser.newPage();
                await page.goto('http://localhost:3033/reports');
                await page.waitForSelector('h2');
                const h1Handle = await page.waitForSelector('h1');
                reportsH1 = await h1Handle.evaluate(h1 => h1.innerText);
            })(),
            (async () => {
                const page = await browser.newPage();
                await page.goto('http://localhost:3033/data-management');
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
