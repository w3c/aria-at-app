const express = require('express');
const path = require('path');
const { create } = require('express-handlebars');
const { gql } = require('apollo-server-core');
const apolloServer = require('../graphql-server');
const staleWhileRevalidate = require('../util/staleWhileRevalidate');

const app = express();

const handlebarsPath = path.resolve(__dirname, '../handlebars/embed');

const hbs = create({
  layoutsDir: path.resolve(handlebarsPath, 'views/layouts'),
  extname: 'hbs',
  defaultLayout: 'index',
  helpers: require(path.resolve(handlebarsPath, 'helpers'))
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.resolve(handlebarsPath, 'views'));

// Prevent refreshing cached data for five seconds - using a short time like
// this is possible because the stale-while-revalidate caching strategy works in
// the background and doesn't spin up more than one simultaneous request.
//
// If queries are very slow, anyone trying to get the refreshed data will get
// stale data for however long it takes for the query to complete.
const millisecondsUntilStale = 5000;

const renderEmbed = async ({
  queryTitle,
  testPlanDirectory,
  protocol,
  host
}) => {
  const { data, errors } = await apolloServer.executeOperation({
    query: gql`
      query TestPlanQuery($testPlanDirectory: ID!) {
        ats {
          id
          name
          browsers {
            id
            name
          }
        }
        testPlan(id: $testPlanDirectory) {
          testPlanVersions {
            id
            title
            phase
            testPlanReports(isFinal: true) {
              id
              metrics
              at {
                id
                name
              }
              browser {
                id
                name
              }
              latestAtVersionReleasedAt {
                id
                name
                releasedAt
              }
            }
          }
        }
      }
    `,
    variables: { testPlanDirectory }
  });

  if (errors) {
    throw new Error(errors);
  }

  let testPlanVersion;

  const recommendedTestPlanVersion = data.testPlan?.testPlanVersions.find(
    testPlanVersion => testPlanVersion.phase === 'RECOMMENDED'
  );

  if (data.testPlan && recommendedTestPlanVersion) {
    testPlanVersion = recommendedTestPlanVersion;
  } else if (data.testPlan) {
    testPlanVersion = data.testPlan.testPlanVersions.find(
      testPlanVersion => testPlanVersion.phase === 'CANDIDATE'
    );
  }

  const testPlanReports = (testPlanVersion?.testPlanReports ?? []).sort(
    (a, b) => {
      if (a.at.name !== b.at.name) {
        return a.at.name.localeCompare(b.at.name);
      }
      return a.browser.name.localeCompare(b.browser.name);
    }
  );

  return hbs.renderView(path.resolve(handlebarsPath, 'views/main.hbs'), {
    layout: 'index',
    dataEmpty: !testPlanVersion?.testPlanReports.length,
    title: queryTitle || testPlanVersion?.title || 'Pattern Not Found',
    phase: testPlanVersion?.phase,
    testPlanVersionId: testPlanVersion?.id,
    testPlanReports,
    protocol,
    host,
    completeReportLink: `${protocol}${host}/report/${testPlanVersion?.id}`,
    embedLink: `${protocol}${host}/embed/reports/${testPlanDirectory}`
  });
};

// staleWhileRevalidate() caching allows this page to handle very high traffic like
// it will see on the APG website. It works by immediately serving a recent
// version of the page and checks for updates in the background.
const renderEmbedCached = staleWhileRevalidate(renderEmbed, {
  getCacheKeyFromArguments: ({ testPlanDirectory }) => testPlanDirectory,
  millisecondsUntilStale
});

app.get('/reports/:testPlanDirectory', async (req, res) => {
  // In the instance where an editor doesn't want to display a certain title
  // as it has defined when importing into the ARIA-AT database for being too
  // verbose, etc. eg. `Link Example 1 (span element with text content)`
  // Usage: https://aria-at.w3.org/embed/reports/command-button?title=Link+Example+(span+element+with+text+content)
  const queryTitle = req.query.title;
  const testPlanDirectory = req.params.testPlanDirectory;
  const host = req.headers.host;
  const protocol = /dev|vagrant/.test(process.env.ENVIRONMENT)
    ? 'http://'
    : 'https://';
  const embedRendered = await renderEmbedCached({
    queryTitle,
    testPlanDirectory,
    protocol,
    host
  });

  // Disable browser-based caching which could potentially make the embed
  // contents appear stale even after being refreshed
  res.set('cache-control', 'must-revalidate').send(embedRendered);
});

app.use(express.static(path.resolve(`${handlebarsPath}/public`)));

module.exports = app;
