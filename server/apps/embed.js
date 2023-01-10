const express = require('express');
const { resolve } = require('path');
const { create } = require('express-handlebars');
const {
    ApolloClient,
    gql,
    HttpLink,
    InMemoryCache
} = require('@apollo/client');
const fetch = require('cross-fetch');

const app = express();
const handlebarsPath =
    process.env.ENVIRONMENT === 'dev' ? 'handlebars' : 'server/handlebars';

// handlebars
const hbs = create({
    layoutsDir: resolve(`${handlebarsPath}/views/layouts`),
    extname: 'hbs',
    defaultLayout: 'index',
    helpers: require(resolve(`${handlebarsPath}/helpers`))
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', resolve(`${handlebarsPath}/views`));

if (process.env.ENVIRONMENT !== 'dev') {
    app.enable('view cache');
}

const client = new ApolloClient({
    link: new HttpLink({ uri: 'http://localhost:5000/api/graphql', fetch }),
    cache: new InMemoryCache()
});

const getLatestReportsForPattern = async pattern => {
    const { data } = await client.query({
        query: gql`
            query {
                testPlanReports(statuses: [CANDIDATE, RECOMMENDED]) {
                    id
                    metrics
                    status
                    at {
                        id
                        name
                    }
                    browser {
                        id
                        name
                    }
                    finalizedTestResults {
                        id
                        atVersion {
                            id
                            name
                            releasedAt
                        }
                    }
                    runnableTests {
                        id
                    }
                    draftTestPlanRuns {
                        testResults {
                            test {
                                id
                            }
                        }
                    }
                    testPlanVersion {
                        id
                        title
                        updatedAt
                        testPlan {
                            id
                        }
                    }
                }
            }
        `
    });

    let title;

    const testPlanReports = data.testPlanReports.filter(report => {
        if (report.testPlanVersion.testPlan.id === pattern) {
            title = report.testPlanVersion.title;
            return true;
        }
    });

    const latestTestPlanVersionId = testPlanReports.sort(
        (a, b) =>
            new Date(a.testPlanVersion.updatedAt) -
            new Date(b.testPlanVersion.updatedAt)
    )[0]?.testPlanVersion.id;

    const latestReports = testPlanReports.filter(
        report => report.testPlanVersion.id === latestTestPlanVersionId
    );

    let allAts = new Set();
    let allBrowsers = new Set();
    let allAtVersionsByAt = {};
    let status = 'RECOMMENDED';
    let reportsByAt = {};

    latestReports.forEach(report => {
        allAts.add(report.at.name);
        allBrowsers.add(report.browser.name);
        if (report.status === 'CANDIDATE') {
            status = report.status;
        }

        allAtVersionsByAt[report.at.name] = report.finalizedTestResults
            .map(result => result.atVersion)
            .reduce((prev, current) =>
                new Date(prev.releasedAt) > new Date(current.releasedAt)
                    ? prev
                    : current
            );
    });

    allBrowsers = Array.from(allBrowsers).sort();

    allAts.forEach(at => {
        reportsByAt[at] = latestReports
            .filter(report => report.at.name === at)
            .sort((a, b) => a.browser.name.localeCompare(b.browser.name));
    });

    return {
        title,
        allBrowsers,
        allAtVersionsByAt,
        latestTestPlanVersionId,
        status,
        reportsByAt
    };
};

app.get('/reports/:pattern', async (req, res) => {
    // In the instance where an editor doesn't want to display a certain title
    // as it has defined when importing into the ARIA-AT database for being too
    // verbose, etc. eg. `Link Example 1 (span element with text content)`
    // Usage: https://aria-at.w3.org/embed/reports/command-button?title=Link+Example+(span+element+with+text+content)
    const queryTitle = req.query.title;
    const pattern = req.params.pattern;
    const protocol = process.env.ENVIRONMENT === 'dev' ? 'http://' : 'https://';
    const {
        title,
        allBrowsers,
        allAtVersionsByAt,
        latestTestPlanVersionId,
        status,
        reportsByAt
    } = await getLatestReportsForPattern(pattern);
    res.render('main', {
        layout: 'index',
        dataEmpty: Object.keys(reportsByAt).length === 0,
        title: queryTitle || title,
        pattern,
        status,
        allBrowsers,
        allAtVersionsByAt,
        reportsByAt,
        completeReportLink: `${protocol}${req.headers.host}/report/${latestTestPlanVersionId}`,
        embedLink: `${protocol}${req.headers.host}/embed/reports/${pattern}`
    });
});

app.use(express.static(resolve(`${handlebarsPath}/public`)));

module.exports = app;
