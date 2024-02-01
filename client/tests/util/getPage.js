const puppeteer = require('puppeteer');
const path = require('path');
const spawn = require('cross-spawn');
const treeKill = require('tree-kill');

let clientServer;
let backendServer;
let browser;

const PORT = 8033;
const CLIENT_PORT = 3033;
const AUTOMATION_SCHEDULER_PORT = 8833;
const baseUrl = 'http://localhost:3033';

const startServer = async serverOrClient => {
    console.log('starting', serverOrClient);
    return new Promise(resolve => {
        const server = spawn('yarn', ['workspace', serverOrClient, 'dev'], {
            cwd: path.resolve(__dirname, '../../'),
            env: {
                PATH: process.env.PATH,
                PORT,
                CLIENT_PORT,
                AUTOMATION_SCHEDULER_PORT: 8833,
                API_SERVER: `http://localhost:${PORT}`,
                APP_SERVER: baseUrl,
                AUTOMATION_SCHEDULER_URL: `http://localhost:${AUTOMATION_SCHEDULER_PORT}`,
                PGDATABASE: 'aria_at_report_test',
                PGPORT: 5432,
                ENVIRONMENT: 'test'
            }
        });

        const killServer = async () => {
            console.log('ending', serverOrClient);
            await new Promise((resolve, reject) => {
                treeKill(server.pid, error => {
                    if (error) return reject(error);
                    console.log('ended', serverOrClient);
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
                console.log('started', serverOrClient);
                resolve({ close: killServer });
            }
        });

        server.stderr.on('data', data => {
            const output = data.toString();
            console.info(output); // eslint-disable-line no-console
        });
    });
};

const setup = async () => {
    // eslint-disable-next-line no-console
    console.info(
        'Starting dev servers. This is required for end-to-end testing'
    );
    [clientServer, backendServer] = await Promise.all([
        startServer('client'),
        startServer('server')
    ]);

    console.log('started browser');
    browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage'] // Required for GitHub environment
    });
    const [extraBlankPage] = await browser.pages();
    extraBlankPage.close();
};

const teardown = async () => {
    await Promise.all([backendServer.close(), clientServer.close()]);

    // Browser might not be defined, if it failed to start
    if (browser) {
        console.log('ended browser');
        await browser.close();
    }
};

let incognitoContexts = {};

const getPage = async (options, callback) => {
    const { role, url } = options;
    if (role == null || !['admin', 'tester', 'vendor', false].includes(role)) {
        throw new Error('Please provide a valid role');
    }

    // if (!incognitoContexts[role]) {
    //     incognitoContexts[role] = await browser.createIncognitoBrowserContext();
    // }
    // const incognitoContext = incognitoContexts[role];

    // const page = await incognitoContext.newPage();
    const page = await browser.newPage();

    if (!url) {
        throw new Error('Please provide a URL, even if it it is simply "/"');
    }

    await page.goto(`http://localhost:${CLIENT_PORT}${url}`);

    if (role) {
        await page.waitForSelector('::-p-text(Test Queue)');
        // await page.waitForSelector('::-p-text(Sign in with GitHub)');

        let roles;
        if (role === 'admin') roles = [{ name: 'ADMIN' }, { name: 'TESTER' }];
        if (role === 'tester') roles = [{ name: 'TESTER' }];
        if (role === 'vendor') roles = [{ name: 'VENDOR' }];
        if (role === 'none') roles = [];

        const username = `pippy-${role}`;

        await page.evaluate(`
            signMeIn({
                username: '${username}',
                roles: ${JSON.stringify(roles)}
            });
        `);

        await page.waitForNavigation();

        await page.waitForSelector('::-p-text(Signed in)');
    }

    await callback(page, { baseUrl });

    await page.close();
};

export default getPage;
export { setup, teardown };
