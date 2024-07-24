/* eslint-disable no-console */
const fs = require('fs').promises;
const path = require('path');
const prettier = require('prettier');
const { execSync } = require('child_process');

const {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink
} = require('@apollo/client');
const getPage = require('../../util/getPage');
const { setup, teardown } = require('../../util/getPage');

const BASE_URL = 'http://localhost:3033';
const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots');

const client = new ApolloClient({
  link: new HttpLink({ uri: `${BASE_URL}/api/graphql` }),
  cache: new InMemoryCache()
});

function killExistingProcesses() {
  try {
    execSync('pkill -f "node.*server/server.js"');
    execSync('pkill -f "node.*next"');
  } catch (error) {
    console.log(
      'No processes to kill or error killing processes:',
      error.message
    );
  }
}

async function shutdown() {
  console.log('Shutting down...');
  killExistingProcesses();
  if (global.browser) {
    await global.browser.close();
  }
  await teardown();
  console.log('Shutdown complete');
}

async function getBaseRoutes() {
  return [
    '/',
    '/signup-instructions',
    '/account/settings',
    '/test-queue',
    '/reports',
    '/candidate-review',
    '/data-management',
    '/404'
    // TODO
    // '/candidate-test-plan/:testPlanVersionId/:atId',
  ];
}

function getCandidateTestPlanRoutes() {
  const atIds = [1, 2, 3];
  const testPlanVersionId = 24;
  return atIds.map(atId => `/candidate-test-plan/${testPlanVersionId}/${atId}`);
}

async function getTestReviewRoutes() {
  const query = gql`
    query GetTestPlanVersionIds {
      testPlanVersions {
        id
      }
    }
  `;
  const { data } = await client.query({ query });
  return data.testPlanVersions.map(({ id }) => `/test-review/${id}`);
}

// The first 19 are valid
async function getReportRoutesForTestPlanVersions() {
  const maxValidTestPlanReportId = 19;
  return Array.from(
    { length: maxValidTestPlanReportId },
    (_, i) => `/test-plan-report/${i + 1}`
  );
}

async function getRunRoutes() {
  const query = gql`
    query GetRunIds {
      testPlanRuns {
        id
      }
    }
  `;

  const { data } = await client.query({ query });
  return data.testPlanRuns.map(({ id }) => `/run/${id}`);
}

async function getDataManagementRoutes() {
  const query = gql`
    query GetTestPlanDirectories {
      testPlans {
        id
        directory
      }
    }
  `;

  const { data } = await client.query({ query });
  return data.testPlans.map(
    ({ directory }) => `/data-management/${directory}/`
  );
}

async function takeSnapshot(browser, role, route) {
  console.log(`Taking snapshot for ${route}`);
  try {
    let snapshot;
    await getPage({ role, url: route }, async page => {
      await page.waitForSelector('main');

      // Remove all <style> and <link rel="stylesheet"> elements
      await page.evaluate(() => {
        const stylesToRemove = document.querySelectorAll(
          'style, link[rel="stylesheet"]'
        );
        stylesToRemove.forEach(el => el.remove());
      });

      const content = await page.content();

      // Prettify the HTML using Prettier, otherwise it is minified
      // and it would be difficult to read diffs
      const prettifiedHtml = await prettier.format(content, {
        parser: 'html',
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        bracketSameLine: true
      });

      snapshot = prettifiedHtml;
    });

    if (!snapshot) {
      throw new Error('Snapshot is undefined');
    }

    return snapshot;
  } catch (error) {
    console.error(`Error taking snapshot for ${route}:`, error);
    throw error;
  }
}

async function takeSnapshots() {
  killExistingProcesses();

  try {
    const browser = await setup();
    global.browser = browser;

    // const routes = await getBaseRoutes();

    // for (const role of ['admin', 'tester', false]) {
    //   for (const route of routes) {
    //     const snapshot = await takeSnapshot(browser, role, route);
    //     const fileName = `${route.replace(/\//g, '_')}_${
    //       role ? role : ''
    //     }.html`;
    //     await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
    //     console.log(`Recorded snapshot for ${route} as ${role}`);
    //   }
    // }

    // const reportRoutes = await getReportRoutesForTestPlanVersions();
    // for (const route of reportRoutes) {
    //   const snapshot = await takeSnapshot(browser, 'admin', route);
    //   const fileName = `${route.replace(/\//g, '_')}.html`;
    //   await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
    //   console.log(`Recorded snapshot for ${route}`);
    // }

    // const dataManagementRoutes = await getDataManagementRoutes();
    // for (const route of dataManagementRoutes) {
    //   const snapshot = await takeSnapshot(browser, 'admin', route);
    //   const fileName = `${route.replace(/\//g, '_')}.html`;
    //   await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
    //   console.log(`Recorded snapshot for ${route}`);
    // }

    // const runRoutes = await getRunRoutes();
    // for (const route of runRoutes) {
    //   const snapshot = await takeSnapshot(browser, 'admin', route);
    //   const fileName = `${route.replace(/\//g, '_')}.html`;
    //   await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
    //   console.log(`Recorded snapshot for ${route}`);
    // }

    // const testReviewRoutes = await getTestReviewRoutes();
    // for (const route of testReviewRoutes) {
    //   try {
    //     const snapshot = await takeSnapshot(browser, 'admin', route);
    //     const fileName = `${route.replace(/\//g, '_')}.html`;
    //     await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
    //     console.log(`Recorded snapshot for ${route}`);
    //   } catch (error) {
    //     console.warn(`Failed to take snapshot for ${route}`, error);
    //     continue;
    //   }
    // }

    const candidateTestPlanRoutes = getCandidateTestPlanRoutes();
    for (const route of candidateTestPlanRoutes) {
      const snapshot = await takeSnapshot(browser, 'admin', route);
      const fileName = `${route.replace(/\//g, '_')}.html`;
      await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
      console.log(`Recorded snapshot for ${route}`);
    }
  } catch (e) {
    console.error('Error during snapshot taking:', e);
  } finally {
    await shutdown();
  }
}

takeSnapshots().catch(console.error);
