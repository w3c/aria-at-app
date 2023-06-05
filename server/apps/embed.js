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

// TODO: Provide through resolvers
const validAtBrowserCombinations = {
    JAWS: new Set(['Firefox', 'Chrome']),
    NVDA: new Set(['Firefox', 'Chrome']),
    'VoiceOver for macOS': new Set(['Firefox', 'Chrome', 'Safari'])
};

const queryReports = async () => {
    const { data, errors } = await apolloServer.executeOperation({
        query: gql`
            query {
                testPlanReports(statuses: [DRAFT, CANDIDATE, RECOMMENDED]) {
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
                        tests {
                            ats {
                                id
                                name
                            }
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
        if (
            report.testPlanVersion.testPlan.id === pattern &&
            report.status !== 'DRAFT'
        ) {
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

// This function gets all the AT + Browser Combinations which have been added to the Test Queue at
// some point; this means if the combination has never been added, a valid combination will be
// marked as 'Not Applicable' rather than 'Data Not Yet Available'.
/*const getAllAtBrowserCombinations = reports => {
    const combinations = {};

    reports.forEach(report => {
        if (!(report.at.name in combinations)) {
            combinations[report.at.name] = new Set();
        }
        combinations[report.at.name].add(report.browser.name);
    });

    return combinations;
};*/

// TODO: Provide through resolvers
// Check if the applicable ATs reported for the tests found for a report link to an already known
// reference of which ATs match against which browsers
const getAllAtBrowserCombinations = reports => {
    const combinations = {};
    const loggedAtIds = [];

    const report = reports[0];
    for (let i = 0; i < report.testPlanVersion.tests.length; i++) {
        const test = report.testPlanVersion.tests[i];
        const atIds = test.ats.map(at => at.id);

        if (!loggedAtIds.includes(1) && atIds.includes('1')) {
            combinations[Object.keys(validAtBrowserCombinations)[0]] =
                Object.values(validAtBrowserCombinations)[0];
            loggedAtIds.push(1);
        }

        if (!loggedAtIds.includes(2) && atIds.includes('2')) {
            combinations[Object.keys(validAtBrowserCombinations)[1]] =
                Object.values(validAtBrowserCombinations)[1];
            loggedAtIds.push(2);
        }

        if (!loggedAtIds.includes(3) && atIds.includes('3')) {
            combinations[Object.keys(validAtBrowserCombinations)[2]] =
                Object.values(validAtBrowserCombinations)[2];
            loggedAtIds.push(3);
        }
    }

    return combinations;
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
    const allAtBrowserCombinations =
        getAllAtBrowserCombinations(allTestPlanReports);
    return hbs.renderView(resolve(handlebarsPath, 'views/main.hbs'), {
        layout: 'index',
        dataEmpty: Object.keys(reportsByAt).length === 0,
        allAtBrowserCombinations,
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
