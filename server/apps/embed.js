const express = require('express');
const { resolve } = require('path');
const { create } = require('express-handlebars');
const { gql } = require('apollo-server-core');
const apolloServer = require('../graphql-server');
const staleWhileRevalidate = require('../util/staleWhileRevalidate');
const hash = require('object-hash');

const app = express();
const handlebarsPath =
    process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'test'
        ? 'handlebars'
        : 'server/handlebars';

// handlebars
const hbs = create({
    layoutsDir: resolve(handlebarsPath, 'views/layouts'),
    extname: 'hbs',
    defaultLayout: 'index',
    helpers: require(resolve(handlebarsPath, 'helpers'))
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', resolve(handlebarsPath, 'views'));

// Prevent refreshing cached data for five seconds - using a short time like
// this is possible because the stale-while-revalidate caching strategy works in
// the background and doesn't spin up more than one simultaneous request.
//
// If queries are very slow, anyone trying to get the refreshed data will get
// stale data for however long it takes for the query to complete.
const millisecondsUntilStale = 5000;

const queryReports = async () => {
    const { data, errors } = await apolloServer.executeOperation({
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

    if (errors) {
        throw new Error(errors);
    }

    const reportsHashed = hash(data.testPlanReports);

    return { allTestPlanReports: data.testPlanReports, reportsHashed };
};

// As of now, a full query for the complete list of reports is needed to build
// the embed for a single pattern. This caching allows that query to be reused
// between pattern embeds.
const queryReportsCached = staleWhileRevalidate(queryReports, {
    millisecondsUntilStale
});

const getLatestReportsForPattern = ({ allTestPlanReports, pattern }) => {
    let title;

    const testPlanReports = allTestPlanReports.filter(report => {
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

const renderEmbed = ({
    allTestPlanReports,
    queryTitle,
    pattern,
    protocol,
    host
}) => {
    const {
        title,
        allBrowsers,
        allAtVersionsByAt,
        testPlanVersionIds,
        status,
        reportsByAt
    } = getLatestReportsForPattern({ pattern, allTestPlanReports });
    return hbs.renderView(resolve(handlebarsPath, 'views/main.hbs'), {
        layout: 'index',
        dataEmpty: Object.keys(reportsByAt).length === 0,
        title: queryTitle || title || 'Pattern Not Found',
        pattern,
        status,
        allBrowsers,
        allAtVersionsByAt,
        reportsByAt,
        completeReportLink: `${protocol}${host}/report/${testPlanVersionIds.join(
            ','
        )}`,
        embedLink: `${protocol}${host}/embed/reports/${pattern}`
    });
};

// Limit the number of times the template is rendered
const renderEmbedCached = staleWhileRevalidate(renderEmbed, {
    getCacheKeyFromArguments: ({ reportsHashed, pattern }) =>
        reportsHashed + pattern,
    millisecondsUntilStale
});

app.get('/reports/:pattern', async (req, res) => {
    // In the instance where an editor doesn't want to display a certain title
    // as it has defined when importing into the ARIA-AT database for being too
    // verbose, etc. eg. `Link Example 1 (span element with text content)`
    // Usage: https://aria-at.w3.org/embed/reports/command-button?title=Link+Example+(span+element+with+text+content)
    const queryTitle = req.query.title;
    const pattern = req.params.pattern;
    const host = req.headers.host;
    const protocol = /dev|vagrant/.test(process.env.ENVIRONMENT)
        ? 'http://'
        : 'https://';
    const { allTestPlanReports, reportsHashed } = await queryReportsCached();
    const embedRendered = await renderEmbedCached({
        allTestPlanReports,
        reportsHashed,
        queryTitle,
        pattern,
        protocol,
        host
    });

    // Disable browser-based caching which could potentially make the embed
    // contents appear stale even after being refreshed
    res.set('cache-control', 'must-revalidate').send(embedRendered);
});

app.use(express.static(resolve(`${handlebarsPath}/public`)));

module.exports = app;
