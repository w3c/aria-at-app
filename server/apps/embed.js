const express = require('express');
const { resolve } = require('path');
const { create } = require('express-handlebars');
const { gql } = require('apollo-server-core');
const staleWhileRevalidate = require('../util/staleWhileRevalidate');

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

const getLatestReportsForPattern = async pattern => {
    const { data } = await global.apolloServer.executeOperation({
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
                    latestAtVersionReleasedAt {
                        id
                        name
                        releasedAt
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

    let allAts = new Set();
    let allBrowsers = new Set();
    let allAtVersionsByAt = {};
    let reportsByAt = {};
    let testPlanVersionIds = new Set();
    const uniqueReports = [];
    let latestReports = [];

    testPlanReports.forEach(report => {
        allAts.add(report.at.name);
        allBrowsers.add(report.browser.name);

        if (!allAtVersionsByAt[report.at.name])
            allAtVersionsByAt[report.at.name] =
                report.latestAtVersionReleasedAt;
        else if (
            new Date(report.latestAtVersionReleasedAt.releasedAt) >
            new Date(allAtVersionsByAt[report.at.name].releasedAt)
        ) {
            allAtVersionsByAt[report.at.name] =
                report.latestAtVersionReleasedAt;
        }

        const sameAtAndBrowserReports = testPlanReports.filter(
            r =>
                r.at.name === report.at.name &&
                r.browser.name === report.browser.name
        );

        // Only add a group of reports with same
        // AT and browser once
        if (
            !uniqueReports.find(group =>
                group.some(
                    g =>
                        g.at.name === report.at.name &&
                        g.browser.name === report.browser.name
                )
            )
        ) {
            uniqueReports.push(sameAtAndBrowserReports);
        }

        testPlanVersionIds.add(report.testPlanVersion.id);
    });

    uniqueReports.forEach(group => {
        if (group.length <= 1) {
            latestReports.push(group.pop());
        } else {
            const latestReport = group
                .sort(
                    (a, b) =>
                        new Date(a.testPlanVersion.updatedAt) -
                        new Date(b.testPlanVersion.updatedAt)
                )
                .pop();

            latestReports.push(latestReport);
        }
    });

    allBrowsers = Array.from(allBrowsers).sort();
    testPlanVersionIds = Array.from(testPlanVersionIds);

    const allAtsAlphabetical = Array.from(allAts).sort((a, b) =>
        a.localeCompare(b)
    );
    allAtsAlphabetical.forEach(at => {
        reportsByAt[at] = latestReports
            .filter(report => report.at.name === at)
            .sort((a, b) => a.browser.name.localeCompare(b.browser.name));
    });

    const hasAnyCandidateReports = Object.values(reportsByAt).find(atReports =>
        atReports.find(report => report.status === 'CANDIDATE')
    );
    let status = hasAnyCandidateReports ? 'CANDIDATE' : 'RECOMMENDED';

    return {
        title,
        allBrowsers,
        allAtVersionsByAt,
        testPlanVersionIds,
        status,
        reportsByAt
    };
};

const getLatestReportsForPatternWithCaching = staleWhileRevalidate({
    expensiveFunction: getLatestReportsForPattern,
    getCacheKeyFromArguments: pattern => pattern,
    millisecondsUntilStale: 15 * 1000
});

app.get('/reports/:pattern', async (req, res) => {
    // In the instance where an editor doesn't want to display a certain title
    // as it has defined when importing into the ARIA-AT database for being too
    // verbose, etc. eg. `Link Example 1 (span element with text content)`
    // Usage: https://aria-at.w3.org/embed/reports/command-button?title=Link+Example+(span+element+with+text+content)
    const queryTitle = req.query.title;
    const pattern = req.params.pattern;
    const protocol = /dev|vagrant/.test(process.env.ENVIRONMENT)
        ? 'http://'
        : 'https://';
    const {
        title,
        allBrowsers,
        allAtVersionsByAt,
        testPlanVersionIds,
        status,
        reportsByAt
    } = await getLatestReportsForPatternWithCaching(pattern);
    res.render('main', {
        layout: 'index',
        dataEmpty: Object.keys(reportsByAt).length === 0,
        title: queryTitle || title || 'Pattern Not Found',
        pattern,
        status,
        allBrowsers,
        allAtVersionsByAt,
        reportsByAt,
        completeReportLink: `${protocol}${
            req.headers.host
        }/report/${testPlanVersionIds.join(',')}`,
        embedLink: `${protocol}${req.headers.host}/embed/reports/${pattern}`
    });
});

app.use(express.static(resolve(`${handlebarsPath}/public`)));

module.exports = app;
