const puppeteer = require('puppeteer');
const path = require('path');
const spawn = require('cross-spawn');
const treeKill = require('tree-kill');
const stripAnsi = require('./stripAnsi');

const isDebugMode = process.argv.some(arg => arg.startsWith('--testTimeout'));

let clientServer;
let backendServer;

const PORT = 8033;
const CLIENT_PORT = 3033;
const AUTOMATION_SCHEDULER_PORT = 8833;
const baseUrl = `http://localhost:${CLIENT_PORT}`;

const startServer = async serverOrClient => {
  console.log(`[DEBUG] Starting ${serverOrClient} server...`);
  return new Promise((resolve, reject) => {
    const server = spawn(
      'yarn',
      serverOrClient === 'server'
        ? ['workspace', 'server', 'dev-debug']
        : ['workspace', 'client', 'dev'],
      {
        cwd: path.resolve(__dirname, '../../'),
        env: {
          ...process.env,
          PATH: process.env.PATH,
          PORT,
          CLIENT_PORT,
          AUTOMATION_SCHEDULER_PORT,
          API_SERVER: `http://localhost:${PORT}`,
          APP_SERVER: baseUrl,
          AUTOMATION_SCHEDULER_URL: `http://localhost:${AUTOMATION_SCHEDULER_PORT}`,
          PGDATABASE: 'aria_at_report_test',
          PGPORT: 5432,
          ENVIRONMENT: 'test'
        }
      }
    );

    console.log(
      `[DEBUG] ${serverOrClient} server process spawned with PID: ${server.pid}`
    );

    server.on('error', error => {
      console.error(`[DEBUG] Error in ${serverOrClient} server:`, error);
      reject(
        new Error(
          `Error raised by ${serverOrClient} startServer process: ${error.message}`
        )
      );
    });

    server.on('exit', (code, signal) => {
      console.log(
        `[DEBUG] ${serverOrClient} server exited with code ${code} and signal ${signal}`
      );
      if (code) {
        console.error(
          `[DEBUG] ${serverOrClient} server exited with code ${code}`
        );
        reject(new Error(`${serverOrClient} server exited with code ${code}`));
      } else if (signal) {
        console.error(
          `[DEBUG] ${serverOrClient} server was killed with signal ${signal}`
        );
        reject(
          new Error(`${serverOrClient} server was killed with signal ${signal}`)
        );
      } else {
        console.info(`[DEBUG] ${serverOrClient} server exited with no errors.`);
        resolve();
      }
    });

    const killServer = async () => {
      console.log(
        `[DEBUG] Attempting to kill ${serverOrClient} server (PID: ${server.pid})`
      );
      await new Promise((resolve, reject) => {
        treeKill(server.pid, error => {
          if (error) {
            console.error(
              `[DEBUG] Error killing ${serverOrClient} server:`,
              error
            );
            return reject(error);
          }
          console.log(`[DEBUG] Successfully killed ${serverOrClient} server`);
          resolve();
        });
      });
    };

    server.stdout.on('data', data => {
      const output = stripAnsi(data.toString());
      console.log(`[DEBUG] ${serverOrClient} stdout:`, output);

      if (
        (serverOrClient === 'server' &&
          output.includes(`Listening on ${PORT}`)) ||
        (serverOrClient === 'client' &&
          output.includes('compiled successfully'))
      ) {
        console.log(`[DEBUG] ${serverOrClient} server started successfully`);
        resolve({ close: killServer });
      }
    });

    server.stderr.on('data', data => {
      const output = data.toString();
      console.error(`[DEBUG] ${serverOrClient} stderr:`, output);
    });

    // Add a timeout
    const timeout = setTimeout(() => {
      console.error(`[DEBUG] ${serverOrClient} server start timed out`);
      killServer().then(() => {
        reject(new Error(`${serverOrClient} server start timed out`));
      });
    }, 60000); // 60 second timeout

    server.on('close', () => {
      clearTimeout(timeout);
    });
  });
};

const setup = async () => {
  // eslint-disable-next-line no-console
  console.info('Starting dev servers. This is required for end-to-end testing');

  [clientServer, backendServer] = await Promise.all([
    startServer('client'),
    startServer('server')
  ]);

  return puppeteer.launch({
    headless: isDebugMode ? false : 'new',
    args: ['--no-sandbox'], // Required for GitHub environment
    devtools: isDebugMode // Allows `debugger;` statements to work
  });
};

const teardown = async () => {
  await Promise.all([backendServer.close(), clientServer.close()]);

  // Browser might not be defined, if it failed to start
  if (global.browser) await global.browser.close();
};

let incognitoContexts = {};

/**
 * Load a page for end-to-end testing.
 * @param {Object} options
 * @param {'admin'|'tester'|'vendor'|false} options.role - The login state
 * of the user.
 * @param {string} options.url - The URL to start on.
 * @param {function} callback - the first argument of the callback function is
 * the page object as documented in Puppeteer. The second argument is an object
 * with the current baseUrl including the localhost port being used - which is
 * needed for navigation.
 */
const getPage = async (options, callback) => {
  const { role, url } = options;
  if (role == null || !['admin', 'tester', 'vendor', false].includes(role)) {
    throw new Error('Please provide a valid role');
  }

  const foundExistingIncognitoContext = !!incognitoContexts[role];

  if (!foundExistingIncognitoContext) {
    incognitoContexts[role] =
      await global.browser.createIncognitoBrowserContext();
  }
  const incognitoContext = incognitoContexts[role];

  const page = await incognitoContext.newPage();

  if (!url) {
    throw new Error('Please provide a URL, even if it it is simply "/"');
  }

  if (isDebugMode) {
    page.setDefaultTimeout(604800000 /* a week should be enough */);
  }

  await page.goto(`${baseUrl}${url}`);

  await page.waitForNetworkIdle();

  await page.evaluate('startTestTransaction()');

  if (role && !foundExistingIncognitoContext) {
    await page.waitForSelector('::-p-text(Sign in with GitHub)');

    const username = `joe-the-${role}`;

    if (role === 'admin') {
      await page.evaluate(`signMeInAsAdmin("${username}")`);
    }
    if (role === 'tester') {
      await page.evaluate(`signMeInAsTester("${username}")`);
    }
    if (role === 'vendor') {
      await page.evaluate(`signMeInAsVendor("${username}")`);
    }

    await page.waitForSelector('::-p-text(Signed in)');
  }

  try {
    await callback(page, { baseUrl });
  } finally {
    await page.evaluate('endTestTransaction()');
  }

  await page.close();
};

module.exports = getPage;
module.exports.setup = setup;
module.exports.teardown = teardown;
