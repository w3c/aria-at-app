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

const client = new ApolloClient({
    link: new HttpLink({ uri: 'http://localhost:5000/api/graphql', fetch }),
    cache: new InMemoryCache()
});

const getLatestReportsForPattern = async pattern => {
    const { data } = await client.query({
        query: gql`
            query {
                testPlanReports(statuses: [CANDIDATE, RECOMMENDED]) {
                    at {
                        name
                    }
                    browser {
                        name
                    }
                    status
                    testPlanVersion {
                        id
                        updatedAt
                        testPlan {
                            id
                        }
                    }
                    metrics
                }
            }
        `
    });

    const testPlanReports = data.testPlanReports.filter(
        report => report.testPlanVersion.testPlan.id === pattern
    );

    const latestTestPlanVersionId = testPlanReports.sort(
        (a, b) =>
            new Date(a.testPlanVersion.updatedAt) -
            new Date(b.testPlanVersion.updatedAt)
    )[0]?.testPlanVersion.id;

    const latestReports = testPlanReports.filter(
        report => report.testPlanVersion.id === latestTestPlanVersionId
    );

    const allBrowsers = new Set();
    let status = 'RECOMMENDED';
    const reportsByBrowser = {};

    latestReports.forEach(report => {
        allBrowsers.add(report.browser.name);
        if (report.status === 'CANDIDATE') {
            status = report.status;
        }
    });

    allBrowsers.forEach(
        browser =>
            (reportsByBrowser[browser] = latestReports.filter(
                report => report.browser.name === browser
            ))
    );

    return { allBrowsers, latestTestPlanVersionId, status, reportsByBrowser };
};

// Expects a query variable of test plan id
app.get('/reports/:pattern', async (req, res) => {
    const pattern = req.params.pattern;
    const protocol = process.env.ENVIRONMENT === 'dev' ? 'http://' : 'https://';
    const {
        allBrowsers,
        latestTestPlanVersionId,
        status,
        reportsByBrowser
    } = await getLatestReportsForPattern(pattern);
    res.render('main', {
        layout: 'index',
        pattern,
        status,
        allBrowsers,
        reportsByBrowser,
        completeReportLink: `${protocol}${req.headers.host}/report/${latestTestPlanVersionId}`,
        embedLink: `${protocol}${req.headers.host}/embed/reports/${pattern}`
    });
});

app.use(express.static(resolve(`${handlebarsPath}/public`)));

module.exports = app;
