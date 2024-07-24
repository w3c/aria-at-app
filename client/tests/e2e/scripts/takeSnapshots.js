/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const prettier = require('prettier');

const {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink
} = require('@apollo/client');
const getPage = require('../../util/getPage');
const { setup, teardown } = require('../../util/getPage');

const BASE_URL = 'http://localhost:3000';
const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots');

const client = new ApolloClient({
  link: new HttpLink({ uri: `${BASE_URL}/api/graphql` }),
  cache: new InMemoryCache()
});

async function getReportRoutesForTestPlanVersions() {
  const maxValidTestPlanReportId = 19;
  return Array.from(
    { length: maxValidTestPlanReportId },
    (_, i) => `/test-plan-report/${i + 1}`
  );
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
    '/invalid-request',
    '/404'
    // TODO
    // '/run/:runId',
    // '/test-plan-report/:testPlanReportId',
    // '/test-review/:testPlanVersionId',
    // '/candidate-test-plan/:testPlanVersionId/:atId',
  ];
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
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0' });

    // Remove all <style> and <link rel="stylesheet"> elements
    await page.evaluate(() => {
      const stylesToRemove = document.querySelectorAll(
        'style, link[rel="stylesheet"]'
      );
      stylesToRemove.forEach(el => el.remove());
    });

    const content = await page.content();

    // Extract only the <body> content
    const bodyContent =
      content.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || '';

    // Prettify the HTML using Prettier, otherwise it is minified
    // and it would be difficult to read diffs
    const prettifiedHtml = prettier.format(bodyContent, {
      parser: 'html',
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      singleQuote: false,
      bracketSameLine: true
    });

    return prettifiedHtml;
  } finally {
    await page.close();
  }
}

async function takeSnapshots() {
  const browser = await setup();

  try {
    const routes = await getBaseRoutes();

    for (const role of ['admin', 'tester', false]) {
      for (const route of routes) {
        const snapshot = await takeSnapshot(browser, role, route);
        const fileName = `${route.replace(/\//g, '_')}_${
          role ? role : ''
        }.html`;
        await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
        console.log(`Recorded snapshot for ${route} as ${role}`);
      }
    }

    const reportRoutes = await getReportRoutesForTestPlanVersions();
    for (const route of reportRoutes) {
      const snapshot = await takeSnapshot(browser, 'admin', route);
      const fileName = `${route.replace(/\//g, '_')}.html`;
      await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
      console.log(`Recorded snapshot for ${route}`);
    }

    const dataManagementRoutes = await getDataManagementRoutes();
    for (const route of dataManagementRoutes) {
      const snapshot = await takeSnapshot(browser, 'admin', route);
      const fileName = `${route.replace(/\//g, '_')}.html`;
      await fs.writeFile(path.join(SNAPSHOTS_DIR, fileName), snapshot);
      console.log(`Recorded snapshot for ${route}`);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await teardown();
    process.exit(0);
  }
}

takeSnapshots().catch(console.error);
